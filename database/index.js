const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.pgUser,
  database: process.env.pgDatabase,
  password: process.env.pgPass,
  // host: process.env.pgHost,
  // port: process.env.pgPort,
  connectionTimeoutMillis: 10,
  allowExitOnIdle: true,
  idleTimeoutMillis: 10
})

// create promise to return the results from Poduct Overview API request for relatedID's
// const relatedProductDataRequest = (relatedIDs) => {

// }

// create promise to retrun the results from Ratings API request for relatedID's
// const relatedRatingsRequest = (relatedIDs) => {

// }

// create promise to retrun the results from querying DB for featuers and values -- also format features and values into needed format here
const relatedFeaturesQuery = (relatedIds, masterID) => {
  const allIds = masterID.concat(relatedIds).join()
  console.log(allIds)
  return client.query(`SELECT * FROM featuresFinal WHERE product_id IN (${allIds});`)
}

module.exports.getRelatedIds = (req, res) => {
  if (!req.query.id) {
    res.status(400).send('missing product ID');
    return;
  }
  // let completeData = {
  //   product_id: {
  //     id: req.query.id,
  //     features: [],
  //     values: []
  //   },
  //   related_ids: [
  //     {

  //     }
  //   ]
  // }
  pool
    .connect()
    .then((client) => {
      return client.query(`SELECT related_ids FROM relatedFinal WHERE current_product_id=${req.query.id}`)
        .then(response => {
          // client.release();
          let ids = response.rows[0].related_ids.split(',').map(Number)
          const allIds = masterID.concat(relatedIds).join()
          console.log(allIds)
          return client.query(`SELECT * FROM featuresFinal WHERE product_id IN (${allIds});`)

          // return promise.all for three async functions created above to get all data needed
            // format data in final then block and send response with object
        })
        .then((features) => {
          client.release();
          console.log(features)
          res.status(200)
          res.send(features)
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



