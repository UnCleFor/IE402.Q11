# HỆ THỐNG BẢN ĐỒ Y TẾ QUỐC GIA  
**National Health Map**

---

## 📌 Thông tin dự án

- **Tên dự án:** Hệ thống bản đồ y tế quốc gia  
- **Thời gian thực hiện:** 27/10/2025 – 27/12/2025  
- **Loại dự án:** Đồ án môn học  
- **Mô tả:** Ứng dụng web cung cấp bản đồ tương tác hiển thị thông tin các cơ sở y tế, nhà thuốc và vùng dịch trên toàn quốc, hỗ trợ người dùng tra cứu và quản trị viên quản lý dữ liệu.

---

## 👥 Thành viên nhóm

| STT | Họ và tên           | MSSV     |
|-----|---------------------|----------|
| 1   | Nguyễn Thanh Nhã    | 22520994 | 
| 2   | Lê Quốc Thái        | 22521318 |
| 3   | Lê Thái Khánh Ngân  | 22520930 |
| 4   | Trần Công Hiển      | 22520425 |
| 5   | Phan Võ Mỹ Huyền    | 22520591 |

---

## ⚙️ Cấu hình môi trường (Environment Variables)

Tạo file `.env` trong thư mục **backend** với các biến sau:

### Cấu hình máy chủ (SERVER)
```
PORT=<cổng_backend>
```

### Cấu hình cơ sở dữ liệu (DATABASE - Supabase PostgreSQL)
```
DB_URL=<supabase_connection_string>
DB_SSL=<true/false>
```

### Cấu hình xác thực (JWT)
```
JWT_SECRET=<token_key>
JWT_REFRESH_SECRET=<refresh_token_key>
```

---

## 🚀 Hướng dẫn chạy dự án

### Phần Backend
1. **Di chuyển vào thư mục backend**
   ```bash
   cd backend
   ```
2. **Tạo file .env** (chỉ cần làm bước này ở lần chạy đầu tiên)
   - Sao chép nội dung từ phần "Cấu hình môi trường" ở trên
   - Điền các giá trị thực tế cho dự án của bạn
3. **Cài đặt dependencies**
   ```bash
   npm install
   ```
4. **Khởi động server backend**
   ```bash
   nodemon server.js
   ```
   Hoặc nếu không có nodemon:
   ```bash
   node server.js
   ```

### Phần Frontend
1. **Di chuyển vào thư mục frontend** (từ thư mục gốc của dự án)
   ```bash
   cd frontend
   ```
2. **Cài đặt dependencies**
   ```bash
   npm install
   ```
3. **Khởi động ứng dụng frontend**
   ```bash
   npm start
   ```

### Truy cập ứng dụng
Sau khi cả backend và frontend đã chạy thành công, truy cập vào trình duyệt và mở:
```
http://localhost:3000
```

---

## 📝 Lưu ý quan trọng
- Đảm bảo đã cài đặt **Node.js** và **npm** trước khi chạy dự án
- File `.env` chỉ cần tạo một lần duy nhất ở lần chạy đầu tiên
- Kiểm tra kỹ các thông tin kết nối database trong file `.env`
- Cổng mặc định của frontend là 3000, của backend có thể khác (tùy theo cấu hình trong file `.env`)
