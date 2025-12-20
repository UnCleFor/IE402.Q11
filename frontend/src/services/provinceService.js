import { api } from "./axiosServices";

const provinceService = {
  searchProvinces: async (data) => {
    try {   
        const response = await api.get(`/provinces/search/`, {
          params: {
            q: data 
          }
        });
        return response.data;
    } catch (error) {
      console.log(`Get province ${data} error:`, error.message);
      return {
        success: false,
        message: "Không thể lấy thông tin tỉnh/thành phố",
      };
    }  
  },
  getAllProvinces: async () => {
    try {   
      const response = await api.get(`/provinces/`); // Endpoint lấy tất cả
      return response.data || [];
    } catch (error) {
      console.log(`Get all provinces error:`, error.message);
      return [];
    }  
  },  
};
export default provinceService;