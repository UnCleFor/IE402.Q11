import { api } from "./axiosServices";

const outbreakServices = {
    // Lấy toàn bộ vùng dịch
    getAllOutbreaks: async () => {
        try {
            const response = await api.get('/outbreak-areas');
            return response.data;
        } catch (error) {
            console.log('Get all outbreaks error:', error.message);
            return {
                success: false,
                message: 'Không thể lấy danh sách bùng phát'
            }
        }
    },

    // Tạo vùng dịch mới
    createOutbreak: async (data) => {
        try {
            const response = await api.post('/outbreak-areas', data);
            return response.data;
        } catch (error) {
            console.log('Create outbreak error:', error.message);
            return {
                success: false,
                message: 'Không thể tạo vùng dịch'
            }
        }
    },

    // Cập nhật vùng dịch theo id
    updateOutbreak: async (id, data) => {
        try {
            const response = await api.put(`/outbreak-areas/${id}`, data);
            return response.data;
        } catch (error) {
            console.log('Update outbreak error:', error.message);
            return {
                success: false,
                message: 'Không thể cập nhật vùng dịch'
            }
        }
    },

    // Xóa vùng dịch theo id
    deleteOutbreak: async (id) => {
        try {
            const response = await api.delete(`/outbreak-areas/${id}`);
            return response.data;
        } catch (error) {
            console.log('Delete outbreak error:', error.message);
            return {
                success: false,
                message: 'Không thể xóa vùng dịch'
            }
        }
    }
}

export default outbreakServices;