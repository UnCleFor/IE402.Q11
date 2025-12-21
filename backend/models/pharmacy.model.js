"use strict";
const {
  Model,
  DataTypes,
  Sequelize
} = require("sequelize");
const sequelize = require("../config/db");
const {
  v4: uuidv4
} = require("uuid");

class Pharmacy extends Model {
}

Pharmacy.init({
  pharmacy_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  pharmacy_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pharmacy_point_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: "locations",
      key: "location_id"
    }
  },
  creator_id: {
    type: DataTypes.STRING,
    references: {
      model: "users",
      key: "user_id"
    }
  },
  address: DataTypes.STRING,
  province_id: DataTypes.STRING,
  status: {
    type: Sequelize.ENUM("active", "inactive"),
    defaultValue: "active",
    allowNull: false
  }
}, {
  sequelize,
  modelName: "Pharmacy",
  tableName: "pharmacies",
  timestamps: true,
});

module.exports = Pharmacy;