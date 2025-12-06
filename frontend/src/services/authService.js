import { api } from './axiosServices';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      // Chỉ log thông tin lỗi, không throw lỗi mới để không hiện đỏ trong console
      if (error.response) {
        // Server trả về lỗi (4xx, 5xx)
        const backendError = error.response.data;
        //console.log('Login error from server:', backendError.error || backendError.message);

        // Trả về object lỗi thay vì throw
        return {
          success: false,
          message: backendError.error || 'Đăng nhập thất bại',
          status: error.response.status
        };

      } else {
        // Lỗi khác
        console.log('Login error:', error.message);
        return {
          success: false,
          message: 'Có lỗi xảy ra khi đăng nhập',
          originalError: error.message
        };
      }
    }
  },

  register: async (user_name, email, password) => {
    try {
      const response = await api.post('/users/register', { user_name, email, password });
      return response.data;
    } catch (error) {
      // console.log('Registration error details:', {
      //   status: error.response?.status,
      //   data: error.response?.data,
      //   message: error.message
      // });
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.log('Get all users error:', error.message);
      return { 
        success: false, 
        message: 'Không thể lấy danh sách người dùng' 
      };
    }
  },

  setToken: (token) => {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
};

const token = authService.getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default authService;