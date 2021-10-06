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

  app.get('/loaderio-ceae28e70f4e8ec8fef359fe5eefc03a.txt', (req, res) => {
    res.send('loaderio-ceae28e70f4e8ec8fef359fe5eefc03a')
  })

  app.use('/api', relatedProducts);

  app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`)
  });

}

