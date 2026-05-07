const Settings = require("../models/settingsModel");

const createDefaultSettings = async () => {
  try {
    const existingSettings = await Settings.findOne();

    if (!existingSettings) {
      await Settings.create({
        siteName: "Mannex Autos",
        siteUrl: "",
        siteTitle: "Best Auto Part Company you can see",
        aboutUs: "best company so far",
        currency: "NGN",
        taxRate: 0,
        bankName: "OPay",
        bankAccountNumber: "8131978483",
        bankAccountName: "Anochili Eric Nonso",
        discountRate: 0,
        address: "no 15 Allen Road, Ikeja, lagos",
        phone: "08131978483",
        email: "ericanox@gmail.com",
        mailTrapToken: "3948589228475",
        paystackSecretKey: "39485729294857",
        logo: "",
        siteFavicon: "",
        frontPicture: "",
      });

      console.log("Default settings created ✅");
    } else {
      console.log("Settings already exist");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = createDefaultSettings;
