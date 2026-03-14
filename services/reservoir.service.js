// services/reservoir.service.js

// Keep a base state in memory so we can fluctuate it lightly
let baseReservoirs = [
    {
        id: 1,
        name: "Mettur Dam (Stanley Reservoir)",
        district: "Salem",
        baseLevel: 112.5,
        totalCapacity: 120,
        baseInflow: 15430,
        baseOutflow: 12000,
        depth: 34.3,
        gateStatus: "Open"
    },
    {
        id: 2,
        name: "Bhavanisagar Dam",
        district: "Erode",
        baseLevel: 85.2,
        totalCapacity: 105,
        baseInflow: 2100,
        baseOutflow: 1800,
        depth: 25.9,
        gateStatus: "Closed"
    },
    {
        id: 3,
        name: "Vaigai Dam",
        district: "Theni",
        baseLevel: 68.4,
        totalCapacity: 71,
        baseInflow: 4500,
        baseOutflow: 4000,
        depth: 20.8,
        gateStatus: "Open"
    },
    {
        id: 4,
        name: "Amaravathi Dam",
        district: "Tiruppur",
        baseLevel: 82.5,
        totalCapacity: 90,
        baseInflow: 900,
        baseOutflow: 500,
        depth: 25.1,
        gateStatus: "Closed"
    },
    {
        id: 5,
        name: "Pechiparai Dam",
        district: "Kanyakumari",
        baseLevel: 42.1,
        totalCapacity: 48,
        baseInflow: 850,
        baseOutflow: 600,
        depth: 14.6,
        gateStatus: "Closed"
    }
];

const getReservoirData = async () => {
    // Generate slight random variations on every API call to simulate "live" data
    const activeData = baseReservoirs.map(res => {
        // Fluctuate level by up to 0.5 feet
        const levelDelta = (Math.random() - 0.5);
        const currentLevel = Math.min(res.totalCapacity, Math.max(0, res.baseLevel + levelDelta));
        
        // Fluctuate flow by up to +/- 5%
        const flowFactor = 0.95 + (Math.random() * 0.1); 
        const currentInflow = Math.round(res.baseInflow * flowFactor);
        const currentOutflow = Math.round(res.baseOutflow * flowFactor);
        
        // Update gate status dynamically if getting dangerously close to totalCapacity (e.g. > 95%)
        let status = res.gateStatus;
        if (currentLevel / res.totalCapacity > 0.95) {
            status = "Open";
        } else if (currentLevel / res.totalCapacity < 0.6) {
            status = "Closed";
        }

        return {
            id: res.id,
            name: res.name,
            district: res.district,
            waterLevel: parseFloat(currentLevel.toFixed(1)),
            totalCapacity: res.totalCapacity,
            inflow: currentInflow,
            outflow: currentOutflow,
            depth: res.depth,
            gateStatus: status,
            lastUpdated: new Date().toISOString()
        };
    });

    return activeData;
};

module.exports = { getReservoirData };
