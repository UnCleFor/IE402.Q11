"use strict";
const {
  Model,
  DataTypes
} = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");
const {
  v4: uuidv4
} = require("uuid");

class User extends Model {
  toJSON() {
    const attrs = {
      ...this.get()
    };
    delete attrs.password;
    return attrs;
  }
}

User.init({
  user_id: {
    type: DataTypes.STRING,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user"
  }
}, {
  sequelize,
  modelName: "User",
  tableName: "users",
  timestamps: true,
  // HOOKS
  hooks: {
    // Hash password khi tạo user
    async beforeCreate(user) {
      user.password = await bcrypt.hash(user.password, 10);
    },

    // Hash password khi update
    async beforeUpdate(user) {
      if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

module.exports = User;