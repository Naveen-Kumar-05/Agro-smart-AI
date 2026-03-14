// services/news.service.js
const getNewsData = async () => {
    return [
        {
            id: 1,
            title: "Tamil Nadu Government Announces New Subsidy for Drip Irrigation",
            category: "TN Schemes",
            description: "The state government has allocated ₹500 crores for drip irrigation subsidies to benefit small-scale farmers in arid regions.",
            image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400",
            source: "TN Agri Dept",
            date: "2026-02-10",
            link: "#"
        },
        {
            id: 2,
            title: "PM-KISAN 16th Installment to be Released Next Month",
            category: "Central Schemes",
            description: "Over 11 crore farmers across India will receive their next installment of ₹2000 directly to their bank accounts.",
            image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400",
            source: "PIB India",
            date: "2026-02-11",
            link: "#"
        },
        {
            id: 3,
            title: "Organic Farming: New Techniques for Higher Yield",
            category: "Agriculture News",
            description: "Sustainable farming experts share insights on multi-cropping and soil health management for the upcoming season.",
            image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80&w=400",
            source: "AgriDaily",
            date: "2026-02-12",
            link: "#"
        }
    ];
};

module.exports = { getNewsData };
