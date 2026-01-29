const router = require('express').Router();
const Telecaller = require('../models/Telecaller');
const NodeCache = require('node-cache');
const bcrypt = require('bcrypt');

// Initialize Cache (StdTTL: 5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

// GET All Staff (Telecallers)
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'staff_list';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const staff = await Telecaller.find({ role: 'staff' }).select('_id name');

        cache.set(cacheKey, staff);
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json(err);
    }
});

// SEED Users (For dev/testing)
router.post('/seed', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const dummyUsers = [
            {
                name: "Staff One",
                email: "staff1@example.com",
                phone: "9876543210",
                pincode: "390001",
                password: hashedPassword,
                role: "staff"
            },
            {
                name: "Staff Two",
                email: "staff2@example.com",
                phone: "1122334455",
                pincode: "410001",
                password: hashedPassword,
                role: "staff"
            },
            {
                name: "Staff Three",
                email: "staff3@example.com",
                phone: "5566778899",
                pincode: "270001",
                password: hashedPassword,
                role: "staff"
            }
        ];

        // Avoid duplicates if seeding multiple times (simple check)
        await Telecaller.deleteMany({ email: { $in: dummyUsers.map(u => u.email) } });

        await Telecaller.insertMany(dummyUsers);
        cache.del('staff_list'); // Clear cache
        res.status(201).json({ message: "Users seeded!", users: dummyUsers.map(u => u.email) });
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

module.exports = router;
