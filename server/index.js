const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('related products API')
});

app.get('/test', (req, res) => {

});


app.listen(PORT, () => {
  console.log('listening on PORT 5000')
});