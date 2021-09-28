const { Pool } = require('pg');
const pool = new Pool({
  user: process.ENV.pgUser,
  database: 'sdctesting',
  password: process.ENV.pgPass,
  port: process.ENV.pgPort,
  connectionTimeoutMillis: 10,
  allowExitOnIdle: true,
  idleTimeoutMillis: 10
})

module.exports.getRelatedIds = (req, res) => {
  if (!req.query.id) {
    res.status(400).send('missing product ID');
    return;
  }
  pool
    .connect()
    .then((client) => {
      return client.query(`SELECT related_ids FROM relatedFinal WHERE current_product_id=${req.query.id}`)
        .then(response => {
          client.release();
          let ids = response.rows[0].related_ids.split(',').map(Number)
          res.status(200)
          res.send(ids)
        })
        .catch(err => {
          client.release();
          res.status(400).send('Error finding ID')
        })
    })
    .catch(err => {
      res.status(400).send('Error connecting to DB')
    })
}



