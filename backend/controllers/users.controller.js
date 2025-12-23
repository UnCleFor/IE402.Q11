const userService = require("../services/users.service");

module.exports = {
  // Tạo mới user
  async create(req, res) {
    try {
      const {
        role,
        user_name,
        email,
        password
      } = req.body;
      const newUser = await userService.createUser({
        role,
        user_name,
        email,
        password
      });

      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Lấy tất cả users
  async findAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },


  // Tìm user theo user_id, email hoặc user_name
  async findUser(req, res) {
    try {
      const {
        user_id,
        email,
        user_name
      } = req.query;

      if (!user_id && !email && !user_name) {
        return res.status(400).json({
          message: "Missing search key"
        });
      }

      const user = await userService.findUser({
        user_id,
        email,
        user_name
      });

      if (!user) return res.status(404).json({
        message: "User not found"
      });

      res.json(user);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }

  },

  // Cập nhật user theo user_id
  async update(req, res) {
    try {
      const {
        user_id
      } = req.params;
      const {
        user_name,
        email,
        password,
        role
      } = req.body;

      const updatedUser = await userService.updateUser(user_id, {
        user_name,
        email,
        password,
        role
      });
      if (!updatedUser) return res.status(404).json({
        message: "User not found"
      });

      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Xóa user theo user_id
  async delete(req, res) {
    try {
      const {
        user_id
      } = req.params;

      const deletedUser = await userService.deleteUser(user_id);
      if (!deletedUser) return res.status(404).json({
        message: "User not found"
      });

      res.json({
        message: "User deleted successfully"
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Đăng nhập
  async login(req, res) {
    try {
      const {
        email,
        password
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and Password are required"
        });
      }

      const result = await userService.loginUser(email, password);

      if (result.success) {
        res.json({
          message: "Login successfully",
          user: result.user,
          token: result.token
        });
      } else {
        res.status(401).json({
          error: result.message
        });
      }
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // Đăng ký
  async register(req, res) {
    try {
      const { user_name, email, password } = req.body;

      // Kiểm tra basic validation
      if (!user_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "User name, Email and Password are required"
        });
      }

      // Gọi service
      const result = await userService.registerUser(user_name, email, password);

      if (result.success) {
        // Thành công
        return res.status(201).json({
          success: true,
          message: "Register successfully",
          user: result.user
        });
      } else {
        // Lỗi từ service
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (err) {
      console.error('Register controller error:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later."
      });
    }
  }
};
