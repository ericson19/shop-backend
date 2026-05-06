const City = require("../models/cityModel");
const State = require("../models/stateModel");
const User = require("../models/userModel");
const Country = require("../models/countryModel");

exports.createCountry = async (req, res) => {
  try {
    const { name, code } = req.body;
    const existingCountry = await Country.findOne({ where: { name } });
    if (existingCountry) {
      return res.status(400).json({ error: "Country already exists" });
    }

    const country = await Country.create({ name, code });
    res.status(201).json({ country });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createState = async (req, res) => {
  try {
    const { name, code, countryId } = req.body;
    const existingState = await State.findOne({ where: { name, countryId } });
    if (existingState) {
      return res
        .status(400)
        .json({ error: "State already exists in this country" });
    }

    const state = await State.create({ name, code, countryId });
    res.status(201).json({ state });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCity = async (req, res) => {
  try {
    const { name, code, stateId, fee } = req.body;
    const existingCity = await City.findOne({ where: { name, stateId } });
    if (existingCity) {
      return res
        .status(400)
        .json({ error: "City already exists in this state" });
    }

    const city = await City.create({ name, code, stateId, fee });

    res.status(201).json({ city });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll();
    res.status(200).json({ countries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStates = async (req, res) => {
  try {
    const { countryId } = req.params;
    const states = await State.findAll({ where: { countryId } });
    res.status(200).json({ states });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await City.findAll({ where: { stateId } });
    res.status(200).json({ cities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryFee = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      include: [
        { model: Country, attributes: ["name"] },
        { model: State, attributes: ["name"] },
        { model: City, attributes: ["name", "fee"] },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      deliveryFee: user.deliveryFee,
      country: user.Country ? user.Country.name : null,
      state: user.State ? user.State.name : null,
      city: user.City ? user.City.name : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeliveryFee = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { fee } = req.body;
    const city = await City.findByPk(cityId);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    city.fee = fee;
    await city.save();
    res.status(200).json({ city });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
