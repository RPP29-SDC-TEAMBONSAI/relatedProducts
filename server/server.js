const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const relatedProducts = require('./routes/related_products.js');

app.use(cors());

app.get('/loaderio-869e2b3ed338110c37011a4aef3844fd.txt', (req, res) => {
  res.send('loaderio-869e2b3ed338110c37011a4aef3844fd')
})

app.use('/api', relatedProducts);


module.exports = app;