const router = require('express').Router();
const axios = require('axios');
const db = require('../../database/index.js');

router.get('/related', db.getRelatedData);

router.put('/addRelatedId', db.addRelatedId);


module.exports = router;
