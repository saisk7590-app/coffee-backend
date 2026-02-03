const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// ================= GET MENU =================
exports.getMenu = async (req, res) => {
  try {
    const categories = await pool.query("SELECT * FROM categories");
    const items = await pool.query("SELECT * FROM items");

    const menu = {};
    categories.rows.forEach(cat => {
      menu[cat.name] = items.rows
        .filter(item => item.category_id === cat.id)
        .map(i => ({ ...i, price: Number(i.price) })); // ensure price is number
    });

    res.json(menu);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ================= CREATE NEW ORDER =================
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items = [{id, name, qty, price}]
    const orderTime = new Date();

    // Add default status "Pending"
    const orderResult = await pool.query(
      "INSERT INTO orders(order_time, status) VALUES($1, $2) RETURNING id, order_time, status",
      [orderTime, "Pending"]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items(order_id, item_id, qty, price) VALUES($1, $2, $3, $4)",
        [orderId, item.id, item.qty, item.price]
      );
    }

    res.json({ orderNo: orderId, orderTime, status: "Pending" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ================= GET ALL ORDERS (CHEF) =================
exports.getOrders = async (req, res) => {
  try {
    const ordersRes = await pool.query(
      "SELECT * FROM orders ORDER BY order_time DESC"
    );

    const orders = [];
    for (const order of ordersRes.rows) {
      const itemsRes = await pool.query(
        `SELECT oi.qty, oi.price, i.name 
         FROM order_items oi 
         JOIN items i ON i.id = oi.item_id 
         WHERE oi.order_id = $1`,
        [order.id]
      );

      orders.push({
        orderNo: order.id,
        orderTime: order.order_time,
        status: order.status || "Pending",
        items: itemsRes.rows
      });
    }

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ================= UPDATE ORDER STATUS (CHEF) =================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderNo, status } = req.body;

    // Validate status
    const allowedStatuses = ["Pending", "In Progress", "Ready", "Served"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await pool.query(
      "UPDATE orders SET status=$1 WHERE id=$2",
      [status, orderNo]
    );

    res.json({ success: true, orderNo, status });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const result = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = result.rows[0];

    // Check password with bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, "CAFENAME_SECRET", { expiresIn: "1d" });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT name, email, phone, role FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ message: "Name and phone required" });

  try {
    await pool.query(
      "UPDATE users SET name=$1, phone=$2 WHERE id=$3",
      [name, phone, req.user.id]
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "All fields required" });

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id=$1",
      [req.user.id]
    );

    const match = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!match) return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password=$1 WHERE id=$2",
      [hashed, req.user.id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};;
