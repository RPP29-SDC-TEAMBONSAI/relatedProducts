const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'client',
  database: 'sdctesting',
  password: 'client',
  port 5432
})