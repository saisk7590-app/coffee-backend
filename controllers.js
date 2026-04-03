const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 ROLE LOGIC
    let role = "customer";
    if (email === "kitchen@cafename.com") {
      role = "chef";
    } else if (email === "admin@cafename.com") {
      role = "admin";
    }

    await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1,$2,$3,$4,$5)`,
      [name, email, phone, hashedPassword, role]
    );

    res.status(201).json({
      message: "User registered successfully",
      role
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "CAFENAME_SECRET",
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MENU =================
exports.getMenu = async (req, res) => {
  try {
    const categories = await pool.query("SELECT * FROM categories");
    const items = await pool.query("SELECT * FROM items");

    const menu = {};
    categories.rows.forEach(cat => {
      menu[cat.name] = items.rows
        .filter(item => item.category_id === cat.id)
        .map(i => ({ ...i, price: Number(i.price) }));
    });

    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const orderTime = new Date();

    const orderResult = await pool.query(
      "INSERT INTO orders(order_time, status) VALUES($1,$2) RETURNING id",
      [orderTime, "Pending"]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items(order_id, item_id, qty, price) VALUES($1,$2,$3,$4)",
        [orderId, item.id, item.qty, item.price]
      );
    }

    res.json({ orderNo: orderId, status: "Pending" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ================= GET ORDERS =================
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
         JOIN items i ON i.id=oi.item_id
         WHERE oi.order_id=$1`,
        [order.id]
      );

      orders.push({
        orderNo: order.id,
        orderTime: order.order_time,
        status: order.status,
        items: itemsRes.rows
      });
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = async (req, res) => {
  const { orderNo, status } = req.body;
  const allowed = ["Pending", "In Progress", "Ready", "Served"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  await pool.query(
    "UPDATE orders SET status=$1 WHERE id=$2",
    [status, orderNo]
  );

  res.json({ success: true });
};

// ================= PROFILE =================
exports.getProfile = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT name,email,phone,role FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json(rows[0]);
};

exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  await pool.query(
    "UPDATE users SET name=$1, phone=$2 WHERE id=$3",
    [name, phone, req.user.id]
  );

  res.json({ message: "Profile updated" });
};

exports.getOwnerContact = async (req, res) => {
  const { rows } = await pool.query(
    `
      SELECT name, phone, email
      FROM users
      WHERE role = 'admin'
      ORDER BY id ASC
      LIMIT 1
    `
  );

  if (!rows[0]) {
    return res.status(404).json({ message: "Owner contact not available" });
  }

  res.json(rows[0]);
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const result = await pool.query(
    "SELECT password FROM users WHERE id=$1",
    [req.user.id]
  );

  const match = await bcrypt.compare(oldPassword, result.rows[0].password);
  if (!match) {
    return res.status(400).json({ message: "Wrong old password" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2",
    [hashed, req.user.id]
  );

  res.json({ message: "Password updated" });
};
