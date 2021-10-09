const axios = require('axios');
const redis = require('redis');
const redisClient = redis.createClient(process.env.redisPORT);
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.pgUser,
  host: process.env.pgHost,
  database: process.env.pgDatabase,
  password: process.env.pgPassword,
  port: process.env.pgPort
})


redisClient.on('client', (err) => {
  console.log(err)
})

const relatedProductDataRequest = (relatedIDs) => {
  const splitID = relatedIDs.join(',')
  return axios.get(`http://34.199.225.65:8080/sdc?ids=${splitID}`, {timeout: 5000})
  .then((response) => {
    return response;
  })
  .catch((err) => {
    // console.log(err)
    return null;
  })
}

const relatedRatingsRequest = (relatedIDs) => {
  const splitID = relatedIDs.join(',')
  return axios.get(`http://13.58.193.244:3000/reviews/relatedRatings?related=${splitID}`, {timeout: 2000})
  .then((response) => {
    return response
  })
  .catch((err) => {
    // console.log(err)
    return null;
  })
}

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
    } else {
      current.rating = 0;
    }
  }
  return allProducts
}

const formatFeatures = (allData, completeData) => {
  allData.rows.map((id) => {
    let pid = id.product_id;
    let product = completeData[pid];
    const featuresValues = separateFeatures(id.features, id.values)
    featuresValues ? product.features = featuresValues : product.features = []

  })
  return completeData
}

const formatProductInfo = (allData, completeData) => {
  for (let object of allData.data) {
    if (object == null) {
      continue
    }
    let pid = object[0][0].id;
    let product = completeData[pid];
    product.name = object[0][0].name
    product.category = object[0][0].category
    product.price = object[0][0].default_price
    product.photos = object[0][0].photos
  }
  return completeData;
}

const formatRatings = (allData, completeData) => {
  allData.data.map((review) => {
    const product = completeData[review.productid]
    if (!product.reviews) {
      product.reviews = [review.rating]
    } else {
      product.reviews.push(review.rating)
    }
  })
  return completeData;
}

module.exports.getRelatedData = (req, res) => {
  if (!req.query.id) {
    res.status(400).send('missing product ID');
    return;
  }

  let completeData = {};
  let finalData = [];



  redisClient.get(req.query.id, (err, cachedData) => {
    if (cachedData) {
      res.status(200).send(cachedData)
    } else {
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
            // const features = relatedFeaturesQuery(relatedIds, req.query.id, client)
            // const ratingInfo = relatedRatingsRequest(relatedIds);
            // const productInfo = relatedProductDataRequest(relatedIds);
            return Promise.all([relatedFeaturesQuery(relatedIds, req.query.id, client), relatedRatingsRequest(relatedIds), relatedProductDataRequest(relatedIds)])
          })
          .then((allData) => {
            if (allData[0] == null) {
              for (let id in completeData) {
                completeData[id].features = [];
              }
            } else {
              completeData = formatFeatures(allData[0], completeData)
            }
            if (allData[1] == null) {
              for (let id in completeData) {
                completeData[id].rating = 0
              }
            } else {
              completeData = formatRatings(allData[1], completeData)
              completeData = averageRatings(completeData)
            }
            if (allData[2] == null) {
              for (let id in completeData) {
                completeData[id].name = ''
                completeData[id].category = ''
                completeData[id].price = ''
                completeData[id].photos = []
              }
            } else {
              completeData = formatProductInfo(allData[2], completeData)
            }
            for (const key in completeData) {
              if (key == req.query.id) {
                continue;
              }
              finalData.push(completeData[key]);
            }

            finalData.push(completeData[req.query.id])
            client.release();
            redisClient.set(req.query.id, JSON.stringify(finalData));
            res.status(200).send(finalData)
          })
          .catch(err => {
            console.log(err)
            client.release();
            res.status(400).send('Error finding ID')
          })
      })
      .catch(err => {
        console.log(err)
        res.status(400).send('Error connecting to database')
      })
    }
  })

}


module.exports.updateRelated = (req, res) => {
  if (!req.query.id || !req.query.related) {
    res.status(400).send('missing product ID');
    return;
  }

  pool
    .connect()
    .then((client) => {
      return client.query(`UPDATE relatedFinal SET related_ids='${req.query.related}' WHERE current_product_id=${req.query.id}`)
      .then((response) => {
        client.release();
        res.status(201).send(`SUCCESS updating ids for product_id = ${req.query.id} with ids = ${req.query.related}`)
      })
      .catch((err) =>  {
        client.release();
        console.log(err);
        res.status(400).send('ERROR updating related Ids in database')
      })
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send('ERROR connecting to database')
    })

}



  // 60586,2064,39443,50885,48811,58299,63465
  // 100000