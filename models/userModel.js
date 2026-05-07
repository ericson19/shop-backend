const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Country = require("./countryModel");
const State = require("./stateModel");
const City = require("./cityModel");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: State,
        key: "id",
      },
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Country,
        key: "id",
      },
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: City,
        key: "id",
      },
    },
  },
  {
    tableName: "users",
  },
);
User.belongsTo(Country, { foreignKey: "countryId" });
Country.hasMany(User, { foreignKey: "countryId" });
User.belongsTo(State, { foreignKey: "stateId" });
State.hasMany(User, { foreignKey: "stateId" });
User.belongsTo(City, { foreignKey: "cityId" });
City.hasMany(User, { foreignKey: "cityId" });

module.exports = User;
