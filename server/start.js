require('dotenv').config();
const app = require('./server.js');
const PORT = 5000

app.listen(PORT, () => {
  console.log(`listening on PORT ${PORT}`)
});