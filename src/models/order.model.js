const { pool } = require("../config/db");

const orderColumns = `
  o.id,
  o.total_amount,
  o.status,
  o.created_at
`;

const orderItemQuery = `
  SELECT
    oi.id,
    oi.order_id,
    oi.item_type,
    oi.item_id,
    oi.quantity,
    oi.price,
    COALESCE(mi.name, p.name, 'Unknown item') AS item_name
  FROM order_items oi
  LEFT JOIN menu_items mi
    ON oi.item_type = 'menu' AND oi.item_id = mi.id
  LEFT JOIN products p
    ON oi.item_type = 'product' AND oi.item_id = p.id
  WHERE oi.order_id = ANY($1)
  ORDER BY oi.id ASC
`;

const attachItems = async (orders) => {
  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);
  const { rows: items } = await pool.query(orderItemQuery, [orderIds]);

  const itemsByOrder = items.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }

    acc[item.order_id].push(item);
    return acc;
  }, {});

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder[order.id] || [],
  }));
};

const findAll = async () => {
  const query = `
    SELECT ${orderColumns}
    FROM orders o
    ORDER BY o.created_at DESC
  `;

  const { rows } = await pool.query(query);
  return attachItems(rows);
};

const create = async ({ items, totalAmount, status = "Pending" }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
        INSERT INTO orders (total_amount, status)
        VALUES ($1, $2)
        RETURNING id, created_at
      `,
      [totalAmount, status]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `
          INSERT INTO order_items (order_id, item_type, item_id, quantity, price)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [orderId, item.itemType, item.itemId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    const [order] = await attachItems([
      {
        id: orderId,
        total_amount: totalAmount,
        status,
        created_at: orderResult.rows[0].created_at,
      },
    ]);

    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateStatus = async (id, status) => {
  const query = `
    UPDATE orders
    SET status = $2
    WHERE id = $1
    RETURNING ${orderColumns}
  `;

  const { rows } = await pool.query(query, [id, status]);

  if (!rows[0]) {
    return null;
  }

  const [order] = await attachItems(rows);
  return order;
};

const getDashboardSummary = async () => {
  const orderQuery = `
    SELECT
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'Ready')::int AS ready_orders,
      COUNT(*) FILTER (
        WHERE DATE(created_at AT TIME ZONE 'Asia/Kolkata') = DATE(NOW() AT TIME ZONE 'Asia/Kolkata')
      )::int AS today_orders,
      COALESCE(
        SUM(total_amount) FILTER (
          WHERE DATE(created_at AT TIME ZONE 'Asia/Kolkata') = DATE(NOW() AT TIME ZONE 'Asia/Kolkata')
        ),
        0
      ) AS today_revenue
    FROM orders
  `;

  const productQuery = `
    SELECT COUNT(*)::int AS total_products
    FROM products
    WHERE is_available = TRUE
  `;

  const [{ rows: orderRows }, { rows: productRows }] = await Promise.all([
    pool.query(orderQuery),
    pool.query(productQuery),
  ]);

  return {
    ...orderRows[0],
    total_products: productRows[0].total_products,
  };
};

module.exports = {
  findAll,
  create,
  updateStatus,
  getDashboardSummary,
};
