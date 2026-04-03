const { pool } = require("../config/db");

const categoryColumns = `
  c.id,
  c.name,
  c.is_available,
  c.created_at,
  c.updated_at
`;

const categoryReturningColumns = `
  id,
  name,
  is_available,
  created_at,
  updated_at
`;

const menuItemColumns = `
  mi.id,
  mi.name,
  mi.price,
  mi.image_url,
  mi.category_id,
  mi.is_available,
  mi.created_at,
  mi.updated_at
`;

const findAll = async ({ includeUnavailable = false, includeItems = false } = {}) => {
  const whereClause = includeUnavailable ? "" : "WHERE c.is_available = TRUE";
  const query = `
    SELECT ${categoryColumns}
    FROM categories c
    ${whereClause}
    ORDER BY c.created_at DESC, c.name ASC
  `;

  const { rows } = await pool.query(query);

  if (!includeItems || rows.length === 0) {
    return rows;
  }

  const categoryIds = rows.map((row) => row.id);
  const itemQuery = `
    SELECT ${menuItemColumns}
    FROM menu_items mi
    WHERE mi.category_id = ANY($1)
    ORDER BY mi.created_at DESC, mi.name ASC
  `;
  const { rows: itemRows } = await pool.query(itemQuery, [categoryIds]);

  const itemsByCategory = itemRows.reduce((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }

    acc[item.category_id].push(item);
    return acc;
  }, {});

  return rows.map((category) => ({
    ...category,
    items: itemsByCategory[category.id] || [],
  }));
};

const findById = async (id) => {
  const query = `
    SELECT ${categoryColumns}
    FROM categories c
    WHERE c.id = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const create = async ({ name, isAvailable }) => {
  const query = `
    INSERT INTO categories (name, is_available)
    VALUES ($1, $2)
    RETURNING ${categoryReturningColumns}
  `;

  const { rows } = await pool.query(query, [name, isAvailable]);
  return rows[0];
};

const update = async ({ id, name, isAvailable }) => {
  const query = `
    UPDATE categories
    SET name = $2,
        is_available = $3
    WHERE id = $1
    RETURNING ${categoryReturningColumns}
  `;

  const { rows } = await pool.query(query, [id, name, isAvailable]);
  return rows[0] || null;
};

const disableWithItems = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const categoryResult = await client.query(
      `
        UPDATE categories
        SET is_available = FALSE
        WHERE id = $1
        RETURNING ${categoryReturningColumns}
      `,
      [id]
    );

    if (!categoryResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE menu_items
        SET is_available = FALSE
        WHERE category_id = $1
      `,
      [id]
    );

    await client.query("COMMIT");
    return categoryResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const enableWithItems = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const categoryResult = await client.query(
      `
        UPDATE categories
        SET is_available = TRUE
        WHERE id = $1
        RETURNING ${categoryReturningColumns}
      `,
      [id]
    );

    if (!categoryResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE menu_items
        SET is_available = TRUE
        WHERE category_id = $1
      `,
      [id]
    );

    await client.query("COMMIT");
    return categoryResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const findGroupedAvailableMenu = async () => {
  const query = `
    SELECT
      c.name AS category_name,
      ${menuItemColumns}
    FROM categories c
    JOIN menu_items mi ON mi.category_id = c.id
    WHERE c.is_available = TRUE
      AND mi.is_available = TRUE
    ORDER BY c.created_at ASC, mi.created_at ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  disableWithItems,
  enableWithItems,
  findGroupedAvailableMenu,
};
