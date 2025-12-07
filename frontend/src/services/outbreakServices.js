import { api } from "./axiosServices";

const outbreakServices = {
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
    }
}

export default outbreakServices