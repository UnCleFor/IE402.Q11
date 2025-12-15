"use strict";
const {
    Model,
    DataTypes
} = require("sequelize");
const sequelize = require("../config/db");
const {
    v4: uuidv4
} = require("uuid");

class Province extends Model {}

Province.init({
    province_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    province_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    province_abbr: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "Province",
    tableName: "provinces",
    timestamps: true,
});

module.exports = Province;