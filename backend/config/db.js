require("dotenv").config();
const {
  Sequelize
} = require("sequelize");

// Kết nối đến cơ sở dữ liệu PostgreSQL sử dụng Sequelize
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres", // Sử dụng PostgreSQL
  logging: false, // Tắt logging để giảm nhiễu console
  dialectOptions: process.env.DB_SSL === "true" ? // Cấu hình SSL nếu cần
    {
      ssl: {
        rejectUnauthorized: false // Cho phép kết nối SSL mà không cần xác thực chứng chỉ
      }
    } :
    {},
});

module.exports = sequelize;