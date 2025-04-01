const express = require('express')
const router = express.Router()
const mapsController = require('../controllers/mapsController')

router.route('/')
    .get(mapsController.getAllRoutes)
    .post(mapsController.createNewRoute)

module.exports = router
