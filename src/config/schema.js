const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

let schemaPromise = null;

const ensureDatabaseSchema = async () => {
  if (!schemaPromise) {
    const schemaPath = path.resolve(__dirname, "../../sql/init.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    schemaPromise = pool.query(schemaSql);
  }

  await schemaPromise;
};

module.exports = {
  ensureDatabaseSchema,
};
