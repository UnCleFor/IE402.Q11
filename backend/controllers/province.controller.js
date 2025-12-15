const provinceService = require("../services/province.service");

module.exports = {
    async create(req, res) {
        try {
            const province = await provinceService.createProvince(req.body);
            res.status(201).json(province);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },

    async findAll(req, res) {
        try {
            const provinces = await provinceService.getAllProvinces();
            res.json(provinces);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },

    async findOne(req, res) {
        try {
            const {
                id
            } = req.params;
            const province = await provinceService.getProvinceById(id);
            if (!province)
                return res.status(404).json({
                    message: "Province not found"
                });
            res.json(province);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },

    // 🔍 tìm kiếm
    async search(req, res) {
        try {
            const {
                q
            } = req.query;
            if (!q) return res.json([]);
            const provinces = await provinceService.searchProvinces(q);
            res.json(provinces);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },

    async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const province = await provinceService.updateProvince(id, req.body);
            if (!province)
                return res.status(404).json({
                    message: "Province not found"
                });
            res.json(province);
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },

    async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const province = await provinceService.deleteProvince(id);
            if (!province)
                return res.status(404).json({
                    message: "Province not found"
                });
            res.json({
                message: "Province deleted successfully"
            });
        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    },
};