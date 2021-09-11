const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const relatedProducts = require('./routes/related_products.js');

app.use(cors());

app.use('/api', relatedProducts);

module.exports = app;