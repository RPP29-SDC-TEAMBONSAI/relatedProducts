const router = require('express').Router();
const axios = require('axios');
const db = require('../../database/index.js');

router.get('/related', db.getRelatedIds)


module.exports = router;
