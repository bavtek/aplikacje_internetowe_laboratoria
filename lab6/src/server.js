const app = require("./app");
const { port } = require("./config/env");
const pool = require("./db/mysql");

async function start() {
  await pool.query("SELECT 1");
  app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
  });
}

start().catch((err) => {
  console.error("Błąd połączenia z bazą:", err.message);
  process.exit(1);
});