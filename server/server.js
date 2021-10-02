require('dotenv').config();

const express = require('express');
const PORT = process.env.PORT
const cluster = require('cluster');
const cpus = require('os').cpus().length;

if (cluster.isMaster) {
  console.log('CPUs: ', cpus);
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    cluster.fork();
  })

} else {
  const app = express();
  const bodyParser = require('body-parser');
  const cors = require('cors');

  const relatedProducts = require('./routes/related_products.js');

  app.use(cors());

  app.get('/loaderio-869e2b3ed338110c37011a4aef3844fd.txt', (req, res) => {
    res.send('loaderio-869e2b3ed338110c37011a4aef3844fd')
  })

  app.use('/api', relatedProducts);

  app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`)
  });

}

