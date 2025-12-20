"use strict";
const {
  Model,
  DataTypes
} = require("sequelize");
const sequelize = require("../config/db");
const {
  v4: uuidv4
} = require("uuid");

class OutbreakArea extends Model {}

OutbreakArea.init({
  outbreak_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  outbreak_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disease_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creator_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "users",
      key: "user_id"
    }
  },
  disease_cases: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  severity_level: {
    type: DataTypes.ENUM("low", "medium", "high"),
    allowNull: false,
    defaultValue: "low",
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  province_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  area_geom: {
    type: DataTypes.GEOMETRY("POLYGON", 4326),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "OutbreakArea",
  tableName: "outbreak_areas",
  timestamps: true,
});

module.exports = OutbreakArea;