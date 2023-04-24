
const express = require('express')
const router = express();

const errorController = require('../controllers/error')
router.set('views', './views/error')

router.get('/*',errorController.error_404)

module.exports = router;