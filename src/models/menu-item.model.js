const { pool } = require("../config/db");

const columns = `
  mi.id,
  mi.name,
  mi.price,
  mi.image_url,
  mi.category_id,
  mi.is_available,
  mi.created_at,
  mi.updated_at,
  c.name AS category_name
`;

const findAll = async ({ includeUnavailable = false } = {}) => {
  const whereClause = includeUnavailable
    ? ""
    : "WHERE mi.is_available = TRUE AND c.is_available = TRUE";
  const query = `
    SELECT ${columns}
    FROM menu_items mi
    JOIN categories c ON c.id = mi.category_id
    ${whereClause}
    ORDER BY mi.created_at DESC, mi.name ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const findById = async (id) => {
  const query = `
    SELECT ${columns}
    FROM menu_items mi
    JOIN categories c ON c.id = mi.category_id
    WHERE mi.id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const create = async ({ name, price, imageUrl, categoryId, isAvailable }) => {
  const query = `
    INSERT INTO menu_items (name, price, image_url, category_id, is_available)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;

  const { rows } = await pool.query(query, [name, price, imageUrl, categoryId, isAvailable]);
  return findById(rows[0].id);
};

const update = async ({ id, name, price, imageUrl, categoryId, isAvailable }) => {
  const query = `
    UPDATE menu_items
    SET name = $2,
        price = $3,
        image_url = $4,
        category_id = $5,
        is_available = $6
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id, name, price, imageUrl, categoryId, isAvailable]);

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
};

const disable = async (id) => {
  const query = `
    UPDATE menu_items
    SET is_available = FALSE
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id]);

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
};

const enable = async (id) => {
  const query = `
    UPDATE menu_items
    SET is_available = TRUE
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id]);

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  disable,
  enable,
};
