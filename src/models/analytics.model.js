const { pool } = require("../config/db");

const getOrdersTrend = async () => {
  const query = `
    WITH days AS (
      SELECT generate_series(
        DATE(NOW() AT TIME ZONE 'Asia/Kolkata') - INTERVAL '6 days',
        DATE(NOW() AT TIME ZONE 'Asia/Kolkata'),
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
      COUNT(o.id)::int AS total_orders
    FROM days
    LEFT JOIN orders o
      ON DATE(o.created_at AT TIME ZONE 'Asia/Kolkata') = days.day
    GROUP BY days.day
    ORDER BY days.day ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getRevenueTrend = async () => {
  const query = `
    WITH days AS (
      SELECT generate_series(
        DATE(NOW() AT TIME ZONE 'Asia/Kolkata') - INTERVAL '6 days',
        DATE(NOW() AT TIME ZONE 'Asia/Kolkata'),
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
      COALESCE(SUM(o.total_amount), 0) AS total_revenue
    FROM days
    LEFT JOIN orders o
      ON DATE(o.created_at AT TIME ZONE 'Asia/Kolkata') = days.day
    GROUP BY days.day
    ORDER BY days.day ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getTopItems = async () => {
  const query = `
    SELECT
      oi.item_id AS id,
      COALESCE(mi.name, p.name, 'Unknown item') AS item_name,
      oi.item_type,
      COALESCE(SUM(oi.quantity), 0)::int AS total_quantity
    FROM order_items oi
    LEFT JOIN menu_items mi
      ON oi.item_type = 'menu' AND oi.item_id = mi.id
    LEFT JOIN products p
      ON oi.item_type = 'product' AND oi.item_id = p.id
    GROUP BY oi.item_id, item_name, oi.item_type
    ORDER BY total_quantity DESC, item_name ASC
    LIMIT 10
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getOrderStatusDistribution = async () => {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'Ready')::int AS ready,
      COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed
    FROM orders
  `;

  const { rows } = await pool.query(query);
  return rows[0];
};

const getSummary = async () => {
  const query = `
    SELECT
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (
        WHERE DATE(created_at AT TIME ZONE 'Asia/Kolkata') = DATE(NOW() AT TIME ZONE 'Asia/Kolkata')
      )::int AS today_orders,
      COALESCE(
        SUM(total_amount) FILTER (
          WHERE DATE(created_at AT TIME ZONE 'Asia/Kolkata') = DATE(NOW() AT TIME ZONE 'Asia/Kolkata')
        ),
        0
      ) AS today_revenue,
      COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'Ready')::int AS ready_orders
    FROM orders
  `;

  const productQuery = `
    SELECT COUNT(*)::int AS total_products
    FROM products
    WHERE is_available = TRUE
  `;

  const [{ rows: summaryRows }, { rows: productRows }] = await Promise.all([
    pool.query(query),
    pool.query(productQuery),
  ]);

  return {
    ...summaryRows[0],
    total_products: productRows[0].total_products,
  };
};

module.exports = {
  getOrdersTrend,
  getRevenueTrend,
  getTopItems,
  getOrderStatusDistribution,
  getSummary,
};
