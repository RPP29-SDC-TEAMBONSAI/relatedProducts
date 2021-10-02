const router = require('express').Router();
const axios = require('axios');
const db = require('../../database/index.js');

router.get('/related', db.getRelatedData)

// router.put('/updateRelated', db.updateRelated)


module.exports = router;
