const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Tạo người dùng mới
async function createUser(data) {
  return await User.create(data);
}

// Lấy tất cả người dùng
async function getAllUsers() {
  return await User.findAll({
    attributes: {
      exclude: ['password']
    }
  });
}

// Tìm người dùng theo user_id, email hoặc user_name
async function findUser({
  user_id,
  email,
  user_name
}) {
  const where = {};

  if (user_id) where.user_id = user_id;
  if (email) where.email = email;
  if (user_name) where.user_name = user_name;

  return await User.findOne({
    where,
    attributes: {
      exclude: ['password']
    }
  });
}

// Cập nhật người dùng theo user_id
async function updateUser(user_id, data) {
  const user = await User.findByPk(user_id);
  if (!user) return null;

  return await user.update(data);
}

// Xóa người dùng theo user_id
async function deleteUser(user_id) {
  const user = await User.findByPk(user_id);
  if (!user) return null;

  await user.destroy();
  return user;
}

// Đăng nhập người dùng
async function loginUser(email, password) {
  // Tìm user theo email
  const user = await User.findOne({
    where: {
      email
    }
  }); 
  if (!user) {
    return {
      success: false,
      message: "Email is not existed"
    };
  }

  // Kiểm tra mật khẩu
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return {
      success: false,
      message: "Password is incorrect"
    };
  }

  // Tạo JWT token
  const token = jwt.sign({
      user_id: user.user_id,
      role: user.role
    },
    JWT_SECRET, {
      expiresIn: '24h'
    }
  );

  return {
    success: true,
    user: user.toJSON(),
    token,
  };
}

// Đăng ký người dùng
async function registerUser( user_name, email, password ) {
  try {    
    // Kiểm tra username tồn tại
    const existingUserByName = await User.findOne({
      where: { 
        user_name 
      }
    });
    
    if (existingUserByName) {
      return {
        success: false,
        message: "User name is already in use"
      };
    }
    // Kiểm tra email tồn tại - SỬA LỖI Ở ĐÂY
    const existingUserByEmail = await User.findOne({
      where: { 
        email 
      }
    });
    
    if (existingUserByEmail) {
      return {
        success: false,
        message: "Email is already in use"
      };
    }
    // Tạo user
    const newUser = await User.create({
      user_name,
      email,
      password
    });
    
    // Chuẩn bị response
    const userResponse = {
      user_id: newUser.user_id,
      user_name: newUser.user_name,
      email: newUser.email
    };
    
    return {
      success: true,
      message: "Register successfully",
      user: userResponse
    };
    
  } catch (error) {
    console.error('Error in registerUser:', error);
    
    // Xử lý lỗi database
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      return {
        success: false,
        message: field === 'email' 
          ? "Email is already in use" 
          : "User name is already in use"
      };
    }
    
    return {
      success: false,
      message: "Registration failed. Please try again."
    };
  }
}

module.exports = {
  createUser,
  getAllUsers,
  findUser,
  updateUser,
  deleteUser,
  loginUser,
  registerUser
};