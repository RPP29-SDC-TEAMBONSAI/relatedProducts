const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('related products API')
});

app.get('/related', (req, res) => {
  /*
  query related DB for related IDs, features, and values
    add information to result array of objects
    create object with productID as var name

  send product request to productOverview API for names, categories, prices, and photoUrls for each ID
    add information to result array of objects

  send ratings request to ratings API for ratings for each relatedID
    add information to result array of objects

    iterate over array of related ID's
      for each -> push object with ID var name to result array

      send array in response
  */

  // expected information response for related endpoint
    /*
      [
       {productId: '',
        productName: '',
        category: '',
        originalPrice: '',
        photoUrls: [],
        salePrice: '',
        rating: '',
        features: [],
        values: []
       }
      ]
    */
});

app.listen(PORT, () => {
  console.log('listening on PORT 5000')
});