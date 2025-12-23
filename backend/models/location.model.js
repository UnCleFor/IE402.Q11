"use strict";
const {
  Model,
  DataTypes
} = require("sequelize");
const sequelize = require("../config/db");
const {
  v4: uuidv4
} = require("uuid");

class Location extends Model { }

Location.init({
  location_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  object_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coordinates: {
    type: DataTypes.GEOMETRY("POINT", 4326),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "Location",
  tableName: "locations",
  timestamps: true,
});

module.exports = Location;