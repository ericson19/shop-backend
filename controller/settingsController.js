const Settings = require("../models/settingsModel");

const createSettings = async (req, res) => {
  try {
    const {
      siteName,
      siteUrl,
      siteTitle,
      aboutUs,
      currency,
      taxRate,
      bankName,
      bankAccountNumber,
      bankAccountName,
      discountRate,
      address,
      country,
      city,
      email,
      phone,
      emailHost,
      emailPort,
      emailUsername,
      emailPassword,
      mailTrapToken,
      paystackPublicKey,
      paystackSecretKey,
    } = req.body;
    const logo = req.files["logo"] ? req.files["logo"][0].path : null;
    const siteFavicon = req.files["siteFavicon"]
      ? req.files["siteFavicon"][0].path
      : null;
    const frontPicture = req.files["frontPicture"]
      ? req.files["frontPicture"][0].path
      : null;

    const newSettings = await Settings.create({
      siteName,
      siteUrl,
      siteTitle,
      aboutUs,
      logo,
      siteFavicon,
      frontPicture,
      currency,
      taxRate,
      bankName,
      bankAccountNumber,
      bankAccountName,
      discountRate,
      address,
      email,
      phone,
      emailHost,
      emailPort,
      emailUsername,
      emailPassword,
      mailTrapToken,
      paystackPublicKey,
      paystackSecretKey,
      country,
      city,
    });
    res.status(201).json(newSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      siteName,
      siteUrl,
      siteTitle,
      aboutUs,
      currency,
      taxRate,
      bankName,
      bankAccountNumber,
      bankAccountName,
      discountRate,
      address,
      country,
      city,

      email,
      phone,
      emailHost,
      emailPort,
      emailUsername,
      emailPassword,
      mailTrapToken,
      paystackPublicKey,
      paystackSecretKey,
    } = req.body;
    const logo = req.files["logo"] ? req.files["logo"][0].path : null;
    const siteFavicon = req.files["siteFavicon"]
      ? req.files["siteFavicon"][0].path
      : null;
    const frontPicture = req.files["frontPicture"]
      ? req.files["frontPicture"][0].path
      : null;

    const settings = await Settings.findOne();
    console.log("Current settings before update:", settings);
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    // settings.siteName = siteName || settings.siteName;
    // settings.siteUrl = siteUrl || settings.siteUrl;
    // settings.siteTitle = siteTitle || settings.siteTitle;
    // settings.aboutUs = aboutUs || settings.aboutUs;
    // settings.logo = logo || settings.logo;
    // settings.siteFavicon = siteFavicon || settings.siteFavicon;
    // settings.frontPicture = frontPicture || settings.frontPicture;
    // settings.currency = currency || settings.currency;
    // settings.taxRate = taxRate || settings.taxRate;
    // settings.bankName = bankName || settings.bankName;
    // settings.bankAccountNumber =
    //   bankAccountNumber || settings.bankAccountNumber;
    // settings.bankAccountName = bankAccountName || settings.bankAccountName;
    // settings.discountRate = discountRate || settings.discountRate;
    // settings.address = address || settings.address;
    if (siteName !== undefined && siteName !== null && siteName !== "")
      settings.siteName = siteName;
    if (siteUrl !== undefined && siteUrl !== null && siteUrl !== "")
      settings.siteUrl = siteUrl;
    if (siteTitle !== undefined && siteTitle !== null && siteTitle !== "")
      settings.siteTitle = siteTitle;
    if (aboutUs !== undefined && aboutUs !== null && aboutUs !== "")
      settings.aboutUs = aboutUs;
    if (logo !== undefined && logo !== null && logo !== "")
      settings.logo = logo;
    if (siteFavicon !== undefined && siteFavicon !== null && siteFavicon !== "")
      settings.siteFavicon = siteFavicon;
    if (
      frontPicture !== undefined &&
      frontPicture !== null &&
      frontPicture !== ""
    )
      settings.frontPicture = frontPicture;
    if (currency !== undefined && currency !== null && currency !== "")
      settings.currency = currency;
    if (taxRate !== undefined && taxRate !== null && taxRate !== "")
      settings.taxRate = taxRate;
    if (bankName !== undefined && bankName !== null && bankName !== "")
      settings.bankName = bankName;
    if (
      bankAccountNumber !== undefined &&
      bankAccountNumber !== null &&
      bankAccountNumber !== ""
    )
      settings.bankAccountNumber = bankAccountNumber;
    if (
      bankAccountName !== undefined &&
      bankAccountName !== null &&
      bankAccountName !== ""
    )
      settings.bankAccountName = bankAccountName;
    if (
      discountRate !== undefined &&
      discountRate !== null &&
      discountRate !== ""
    )
      settings.discountRate = discountRate;
    if (address !== undefined && address !== null && address !== "")
      settings.address = address;
    if (country !== undefined && country !== null && country !== "")
      settings.country = country;
    if (city !== undefined && city !== null && city !== "")
      settings.city = city;
    if (email !== undefined && email !== null && email !== "")
      settings.email = email;
    if (phone !== undefined && phone !== null && phone !== "")
      settings.phone = phone;
    if (emailHost !== undefined && emailHost !== null && emailHost !== "")
      settings.emailHost = emailHost;
    if (emailPort !== undefined && emailPort !== null && emailPort !== "")
      settings.emailPort = emailPort;
    if (
      emailUsername !== undefined &&
      emailUsername !== null &&
      emailUsername !== ""
    )
      settings.emailUsername = emailUsername;
    if (
      emailPassword !== undefined &&
      emailPassword !== null &&
      emailPassword !== ""
    )
      settings.emailPassword = emailPassword;
    if (
      mailTrapToken !== undefined &&
      mailTrapToken !== null &&
      mailTrapToken !== ""
    )
      settings.mailTrapToken = mailTrapToken;
    if (
      paystackPublicKey !== undefined &&
      paystackPublicKey !== null &&
      paystackPublicKey !== ""
    )
      settings.paystackPublicKey = paystackPublicKey;
    if (
      paystackSecretKey !== undefined &&
      paystackSecretKey !== null &&
      paystackSecretKey !== ""
    )
      settings.paystackSecretKey = paystackSecretKey;

    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createSettings, getSettings, updateSettings };
