const sequelize = require("../config/db");
const { DataTypes, Model } = require("sequelize");
const Country = require("./countryModel");

const State = sequelize.define(
  "State",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      reference: {
        key: "id",
        model: Country,
      },
    },
  },
  {
    tableName: "states",
  },
);
State.belongsTo(Country, { foreingKey: "countryId" });
Country.hasMany(State, { foreingKey: "countryId" });
module.exports = State;
