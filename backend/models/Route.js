const mongoose = require('mongoose');

/**
 * We want to save the following:
 * - Route Name : string
 * - Route Description : string
 * - Route Overview Path : array of lat lng objects
 * - Markers: array of lat, lng, waypoint names
 * - Route Waypoints: array of google.maps.DirectionWaypoint
 * - Distance : number
 * - Elevation Gain : number
 * - Elevation Loss : number
 */

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  overviewPath: [{
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  }],
  markers: [{
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      default: ""
    }
  }],
  waypoints: [{
    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    stopover: {
      type: Boolean,
      default: true
    }
  }],
  distance: {
    type: Number,
    default: 0,
    min: 0
  },
  elevationGain: {
    type: Number,
    default: 0,
    min: 0
  },
  elevationLoss: {
    type: Number,
    default: 0,
    min: 0
  },
})

module.exports = mongoose.model('Route', routeSchema)