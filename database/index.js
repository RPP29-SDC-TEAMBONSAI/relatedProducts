const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'client',
  database: 'sdctesting',
  password: 'client',
  port: 5432
})

module.exports.getRelatedIds = (req, res) => {
  if (!req.query.id) {
    res.status(400).send('missing product ID');
    return;
  }
  pool
    .connect()
    .then(client => {
      return client.query(`SELECT related_ids FROM relatedFeatures WHERE product_id=${req.query.id}`)
        .then(response => {
          let ids = response.rows[0].related_ids.split(',').map(Number)
          client.release();
          res.send(ids)
        })
        .catch(err => {
          client.release();
          res.status(400).send('ID not found')
        })
    })
    .catch(err => {
      res.status(400).send('DB connection error')
    })


}

