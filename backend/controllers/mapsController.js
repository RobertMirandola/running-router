const Route = require('../models/Route');
const asyncHandler = require('express-async-handler');

const getAllRoutes = asyncHandler(async (req, res) => {
  const runningRoutes = await Route.find().lean();

  if (!runningRoutes?.length) {
    return res.status(400).json({ message: 'No routes found' });
  }

  res.json(runningRoutes);
})

const createNewRoute = asyncHandler(async (req, res) => {
  const { name, description, overviewPath, encodedPolyline, markers, waypoints, distance, elevationGain, elevationLoss } = req.body;

  const routeObject = { name, description, overviewPath, encodedPolyline, markers, waypoints, distance, elevationGain, elevationLoss };

  const route = await Route.create(routeObject);

  console.log('Route successfully saved to database');

  if (route) { // created 
    res.status(201).json({ message: `New route ${name} created` });
  } else {
    res.status(400).json({ message: 'Invalid route data received' });
  }
})

module.exports = {
  getAllRoutes,
  createNewRoute,
}