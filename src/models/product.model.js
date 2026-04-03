const { pool } = require("../config/db");

const columns = `
  id,
  name,
  price,
  unit,
  description,
  image_url,
  category,
  is_available,
  created_at,
  updated_at
`;

const findAll = async ({ includeUnavailable = false } = {}) => {
  const whereClause = includeUnavailable ? "" : "WHERE is_available = TRUE";
  const query = `
    SELECT ${columns}
    FROM products
    ${whereClause}
    ORDER BY created_at DESC, name ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const findById = async (id) => {
  const query = `
    SELECT ${columns}
    FROM products
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const create = async ({ name, price, unit, description, imageUrl, category, isAvailable }) => {
  const query = `
    INSERT INTO products (name, price, unit, description, image_url, category, is_available)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  const { rows } = await pool.query(query, [
    name,
    price,
    unit,
    description,
    imageUrl,
    category,
    isAvailable,
  ]);

  return findById(rows[0].id);
};

const update = async ({ id, name, price, unit, description, imageUrl, category, isAvailable }) => {
  const query = `
    UPDATE products
    SET name = $2,
        price = $3,
        unit = $4,
        description = $5,
        image_url = $6,
        category = $7,
        is_available = $8
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [
    id,
    name,
    price,
    unit,
    description,
    imageUrl,
    category,
    isAvailable,
  ]);

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
};

const disable = async (id) => {
  const query = `
    UPDATE products
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
    UPDATE products
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
