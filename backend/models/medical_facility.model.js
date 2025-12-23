"use strict";
const {
  Model,
  DataTypes
} = require("sequelize");
const sequelize = require("../config/db");
const {
  v4: uuidv4
} = require("uuid");

class MedicalFacility extends Model { }

MedicalFacility.init({
  facility_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  facility_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  facility_point_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: "locations",
      key: "location_id"
    }
  },
  type_id: DataTypes.STRING,
  creator_id: {
    type: DataTypes.STRING,
    references: {
      model: "users",
      key: "user_id"
    }
  },
  services: DataTypes.TEXT,
  address: DataTypes.STRING,
  province_id: DataTypes.STRING,
  phone: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
}, {
  sequelize,
  modelName: "MedicalFacility",
  tableName: "medical_facilities",
  timestamps: true,
});

module.exports = MedicalFacility;