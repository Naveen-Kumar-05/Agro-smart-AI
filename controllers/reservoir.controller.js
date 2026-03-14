// controllers/reservoir.controller.js
const reservoirService = require("../services/reservoir.service");

const getReservoirs = async (req, res) => {
    try {
        const data = await reservoirService.getReservoirData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reservoir data", error: error.message });
    }
};

module.exports = { getReservoirs };
