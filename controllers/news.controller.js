// controllers/news.controller.js
const newsService = require("../services/news.service");

const getNews = async (req, res) => {
    try {
        const data = await newsService.getNewsData();
        const { category } = req.query;

        if (category && category !== "All") {
            const filtered = data.filter(item => item.category === category);
            return res.json(filtered);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching news data", error: error.message });
    }
};

module.exports = { getNews };
