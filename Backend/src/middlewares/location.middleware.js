require("dotenv").config();
const asyncHandler = require("../utils/asyncHandler.utils");
const ApiError = require("../utils/ApiError.utils");

const Location = asyncHandler(async (req, resp, next) => {
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    throw new ApiError(400, `Coordinates not given`);
  }

  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.GEO_API}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      req.location = `${data.features[0].properties.city}, ${data.features[0].properties.state} ${data.features[0].properties.country}`;
      next();
    })
    .catch((err) => console.error(err));
});

module.exports = { Location };
