require("dotenv").config();

const app = require("./app");
const { testConnection } = require("./config/db");
const { ensureDatabaseSchema } = require("./config/schema");

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await testConnection();
    await ensureDatabaseSchema();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Coffee shop backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
};

startServer();
