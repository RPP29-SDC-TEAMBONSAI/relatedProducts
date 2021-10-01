const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.pgUser,
  database: process.env.pgDatabase,
  password: process.env.pgPass,
  host: process.env.pgHost,
  port: process.env.pgPort,
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
const relatedFeaturesQuery = (relatedIds, masterID, client) => {
  relatedIds.unshift(Number(masterID))
  return client.query(`SELECT * FROM featuresFinal WHERE product_id IN (${relatedIds});`)
};

const separateFeatures = (features, values) => {
  const featuresFinal = [];
  const f = features.split(',');
  const v = values.split(',');
  f.map((feature, index) => {
    const featureValuePair = {
      feature: feature,
      value: v[index]
    }
    featuresFinal.push(featureValuePair)
  })
  return featuresFinal;
}

module.exports.getRelatedIds = (req, res) => {
  console.log(req.query.id)
  if (!req.query.id) {
    res.status(400).send('missing product ID');
    return;
  }
  let completeData = {};
  let finalData = [];

  pool
    .connect()
    .then((client) => {
      return client.query(`SELECT related_ids FROM relatedFinal WHERE current_product_id=${req.query.id}`)
        .then(response => {
          // client.release();
          let relatedIds = response.rows[0].related_ids.split(',').map(Number)
          let allIds = relatedIds;
          allIds.unshift(Number(req.query.id))
          allIds.map((currentID) => {
            const productInfo = {
              id: currentID
            }
            completeData[currentID] = productInfo
          })
          const features = relatedFeaturesQuery(relatedIds, req.query.id, client)
          // return promise.all for three async functions created above to get all data needed
            // format data in final then block and send response with object
          return Promise.all([features])
        })
        // .then((allData) => {
        //   //handle the data formatting here

        // })
        .then((allData) => {
          client.release();
          allData[0].rows.map((id) => {
            let pid = id.product_id;
            let product = completeData[pid];
            const featuresValues = separateFeatures(id.features, id.values)
            product.features = featuresValues
          })
          for (const key in completeData) {
            if (key == req.query.id) {
              continue;
            }
            finalData.push(completeData[key]);
          }
          finalData.push(completeData[req.query.id])
          console.log(finalData)
          res.status(200)
          res.send(finalData)
        })
        .catch(err => {
          console.log(err)
          client.release();
          res.status(400).send('Error finding ID')
        })
    })
    .catch(err => {
      res.status(400).send('Error connecting to DB')
    })
}



