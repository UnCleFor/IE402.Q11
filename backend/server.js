const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Cấu hình CORS đơn giản
const corsOptions = {
  origin: 'http://localhost:3000', // Chỉ cho phép frontend localhost:3000
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Sử dụng middleware CORS
app.use(cors(corsOptions));

app.use(express.json());

// Import routes tổng
const apiRoutes = require("./routes/index");

// Gắn prefix cho tất cả route API
app.use("/api", apiRoutes);

// Đồng bộ DB trước khi listen
const sequelize = require("./config/db");

// Đồng bộ tất cả model với Supabase
sequelize
  .sync({ force: false }) // false = không xóa bảng cũ, true = tạo lại từ đầu
  .then(() => console.log("Database & tables created on Supabase!"))
  .catch((err) => console.error("DB sync error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:3000`);
});