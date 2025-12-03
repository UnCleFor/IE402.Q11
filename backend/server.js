const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

app.use(cors())
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
});
