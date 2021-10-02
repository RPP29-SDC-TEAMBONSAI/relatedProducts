const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.pgUser,
  host: process.env.pgHost,
  database: process.env.pgDatabase,
  password: process.env.pgPassword,
  port: process.env.pgPort,
  // connectionTimeoutMillis: 50,
  // allowExitOnIdle: true,
  // idleTimeoutMillis: 100
})
const axios = require('axios');

// create promise to return the results from Poduct Overview API request for relatedID's
// const relatedProductDataRequest = (relatedIDs) => {
//   const splitID = relatedIDs.join(',')
//   return axios.get(`productURL${splitIDs}`)
// }

// create promise to retrun the results from Ratings API request for relatedID's
const relatedRatingsRequest = (relatedIDs) => {
  const splitID = relatedIDs.join(',')
  return axios.get(`http://3.131.220.252:3000/reviews/relatedRatings?related=${splitID}`)
}

// create promise to retrun the results from querying DB for featuers and values -- also format features and values into needed format here
const relatedFeaturesQuery = (relatedIds, masterID, client) => {
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

const averageRatings = (allProducts) => {
  const reducer = (prev, cur) => prev + cur;
  for (let product in allProducts) {
    const current = allProducts[product]
    if (current.reviews) {
      const length = current.reviews.length;
      const sum = current.reviews.reduce(reducer);
      const average = sum/length;
      current.rating = average
      delete current.reviews;
    }
  }
  return allProducts
}

module.exports.getRelatedData = (req, res) => {
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
          // const productInfo = relatedProductDataRequest(relatedIds);
          const ratingInfo = relatedRatingsRequest(relatedIds);
          return Promise.all([features, ratingInfo])
        })
        // .then((allData) => {
        //   //handle the data formatting here

        // })
        .then((allData) => {
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
          let currentID = 0;
          allData[1].data.map((review) => {
            const product = completeData[review.productid]
            if (!product.reviews) {
              product.reviews = [review.rating]
            } else {
              product.reviews.push(review.rating)
            }
          })
          const updatedData = averageRatings(completeData)
          finalData.push(completeData[req.query.id])
          client.release();
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
      console.log(err)
      res.status(400).send('Error connecting to DB')
    })
}

// module.exports.updateRelated = (req, res) => {
//   if (!req.query.id) {
//     res.status(400).send('missing product ID');
//     return;
//   }
//   // let relatedIds = req.query.related.join('')
//   let completeData = {};
//   let finalData = [];
//   res.status(200)
//   res.send(`UPDATED ID ${req.query.id} WITH NEW RELATED IDS ${req.query.related}`)

//   // pool
//   //   .connect()
//   //   .then((client) => {
//   //     return client.query(`UPDATE relatedFinal SET related_ids= WHERE current_product_id=${req.query.id}`)
//   //   })
// }



// ratings endpoint
//   module.exports.getRatings = (req, res) => {
//     const relatedIds = req.query.ids.map(Number)
//     return client.query(`SELECT (id, ratings) FROM metaData WHERE product_id IN (${relatedIds})`)
//       .then((data) => {
//         res.send(data)
//       })
//   }
