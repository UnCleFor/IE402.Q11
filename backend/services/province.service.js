const {
    Op
} = require("sequelize");
const Province = require("../models/province.model");

module.exports = {
    // Tạo tỉnh
    async createProvince(data) {
        return await Province.create(data);
    },

    // Lấy tất cả tỉnh
    async getAllProvinces() {
        return await Province.findAll();
    },

    // Lấy tỉnh theo ID (PK)
    async getProvinceById(id) {
        return await Province.findByPk(id);
    },

    // Tìm kiếm theo province_id / province_name / province_abbr
    async searchProvinces(keyword) {
        return await Province.findAll({
            where: {
                [Op.or]: [{
                        province_id: {
                            [Op.iLike]: `%${keyword}%`
                        }
                    },
                    {
                        province_name: {
                            [Op.iLike]: `%${keyword}%`
                        }
                    },
                    {
                        province_abbr: {
                            [Op.iLike]: `%${keyword}%`
                        }
                    },
                ],
            },
        });
    },

    // Cập nhật tỉnh
    async updateProvince(id, data) {
        const province = await Province.findByPk(id);
        if (!province) return null;
        return await province.update(data);
    },

    // Xóa tỉnh
    async deleteProvince(id) {
        const province = await Province.findByPk(id);
        if (!province) return null;
        await province.destroy();
        return province;
    },
};