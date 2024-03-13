const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "password",
  host: "my-db.czhyu20vbehy.ap-south-1.rds.amazonaws.com",
  port: 5432,
  database: "initial_db",
});

module.exports = pool;
