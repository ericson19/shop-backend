const express = require("express");
const router = express.Router();
const {
  createCountry,
  createState,
  createCity,
  getCountries,
  getStates,
  getCities,
  getDeliveryFee,
  updateDeliveryFee,
} = require("../controller/locationController");
const { protect, role } = require("../middleware/authMiddleware");

router.post("/countries", protect, role("admin"), createCountry);
router.post("/states", protect, role("admin"), createState);
router.post("/cities", protect, role("admin"), createCity);
router.get("/countries", getCountries);
router.get("/states/:countryId", getStates);
router.get("/cities/:stateId", getCities);
router.get("/delivery-fee/:userId", getDeliveryFee);
router.put("/delivery-fee/:userId", protect, role("admin"), updateDeliveryFee);

module.exports = router;
