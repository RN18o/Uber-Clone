const rideServices = require("../services/Ride.services");
const { validationResult } = require("express-validator");
const { sendMessageToSocketId } = require("../Socket");
const mapService = require("../services/Map.services");

module.exports.createride = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // console.log(req.body);
  const { pickup, destination, vehicleType } = req.body;
  console.log(req.body);

  try {
    const ride = await rideServices.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });
    // send response immediately
    res.status(201).json(ride);

    // Fire-and-forget notification logic: don't use `res` here to avoid "Cannot set headers" errors
    (async () => {
      try {
        const pickupCoordinates = await mapService.getAddressCoordinates(pickup);
        console.log(pickupCoordinates);

        // fix: use `lat` (not `ltd`) from coordinates
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
          pickupCoordinates.lat,
          pickupCoordinates.lng,
          2
        );

        // hide OTP when notifying captains
        const notifyPayload = Object.assign({}, ride);
        if (notifyPayload && typeof notifyPayload === 'object') notifyPayload.otp = "";

        captainsInRadius.forEach((captain) => {
          try {
            sendMessageToSocketId(captain.socketId, {
              event: "new-ride",
              data: notifyPayload,
            });
          } catch (sendErr) {
            console.error('Error sending socket message to', captain.socketId, sendErr);
          }
        });
      } catch (notifyErr) {
        // Log notification errors but do not attempt to send another HTTP response
        console.error('Error notifying captains for new ride:', notifyErr);
      }
    })();
  } catch (err) {
    // Only send error if we haven't already sent a response
    if (!res.headersSent) {
      return res.status(500).json({ message: err.message });
    }
    console.error('Error creating ride (response already sent):', err);
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideServices.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } s
}
