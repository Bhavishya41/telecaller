const router = require('express').Router();
const Business = require('../models/Business');
const NodeCache = require('node-cache');

// Initialize Cache (StdTTL: 5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

// GET Businesses
router.get('/', async (req, res) => {
    try {
        const { pincode, city, state, category, type } = req.query;

        // Generate a unique cache key based on query params
        const cacheKey = JSON.stringify(req.query);

        // Check if data is in cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        let businesses;

        if (pincode) {
            // Exact match
            businesses = await Business.find({ pincode: pincode });

            // Broad match (first 3 digits) fallback
            if (businesses.length === 0) {
                const broadPincode = pincode.substring(0, 3);
                businesses = await Business.find({ pincode: { $regex: `^${broadPincode}` } });
            }
        } else {
            // 2. Admin/Filter Logic
            let query = {};

            // Search Logic (Name or Phone)
            const { search } = req.query;
            if (search) {
                query.$or = [
                    { businessName: { $regex: search, $options: 'i' } },
                    { phoneNumbers: { $regex: search, $options: 'i' } }
                ];
            }

            if (city) query.city = { $regex: city, $options: 'i' };
            if (state) query.state = { $regex: state, $options: 'i' };
            if (category && category !== 'All') query.category = category;
            if (type && type !== 'All') query.type = type;
            if (req.query.registered !== undefined && req.query.registered !== 'All') {
                query.registered = req.query.registered === 'true';
            }
            if (req.query.assignedTo) {
                query.assignedTo = req.query.assignedTo;
            }

            businesses = await Business.find(query).populate('assignedTo', 'name email');
        }

        // Save to cache before returning
        cache.set(cacheKey, businesses);
        res.status(200).json(businesses);

    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// GET Single Business by ID
router.get('/:id', async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json("Business not found");
        }
        res.status(200).json(business);
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// ADD Business
router.post('/', async (req, res) => {
    try {
        const newBusiness = new Business(req.body);
        const savedBusiness = await newBusiness.save();

        // Clear value-based cache or flush all to be safe and simple
        cache.flushAll();

        res.status(201).json(savedBusiness);
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// BULK IMPORT Businesses
router.post('/import', async (req, res) => {
    try {
        const businesses = req.body;
        if (!Array.isArray(businesses) || businesses.length === 0) {
            return res.status(400).json("Invalid data format. Expected an array of businesses.");
        }

        const savedBusinesses = await Business.insertMany(businesses);

        // Clear cache
        cache.flushAll();

        res.status(201).json(savedBusinesses);
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// ASSIGN Businesses
router.put('/assign', async (req, res) => {
    try {
        const { businessIds, staffId, message } = req.body;

        if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
            return res.status(400).json("No businesses selected");
        }

        if (!staffId) {
            return res.status(400).json("No staff member selected");
        }

        await Business.updateMany(
            { _id: { $in: businessIds } },
            { $set: { assignedTo: staffId, assignmentMessage: message || "" } }
        );

        cache.flushAll();
        res.status(200).json("Businesses assigned successfully");
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// UPDATE Business
router.put('/:id', async (req, res) => {
    try {
        const updatedBusiness = await Business.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedBusiness) return res.status(404).json("Business not found");

        cache.flushAll(); // Invalidate cache
        res.status(200).json(updatedBusiness);
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// DELETE Business
router.delete('/:id', async (req, res) => {
    try {
        const deletedBusiness = await Business.findByIdAndDelete(req.params.id);

        if (!deletedBusiness) return res.status(404).json("Business not found");

        cache.flushAll(); // Invalidate cache
        res.status(200).json("Business has been deleted...");
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

// SEED Businesses (For dev/testing)
router.post('/seed', async (req, res) => {
    try {
        const dummyBusinesses = [
            {
                businessName: "Tech Solutions",
                ownerName: "John Doe",
                email: "john@tech.com",
                phoneNumbers: ["1234567890", "0987654321"],
                pincode: "390001",
                category: "Computer & IT Softwares",
                type: "Retailer",
                website: "https://techsolutions.com",
                address: "Connaught Place, Block A",
                city: "New Delhi",
                district: "New Delhi",
                state: "Delhi",
                country: "India",
                registered: false,
                assignedTo: null
            },
            {
                businessName: "Auto World",
                ownerName: "Mike Ross",
                email: "mike@auto.com",
                phoneNumbers: ["1122334455"],
                pincode: "110001",
                category: "Automobile",
                type: "Retailer",
                website: "",
                address: "Karol Bagh, Market Street",
                city: "New Delhi",
                district: "Central Delhi",
                state: "Delhi",
                country: "India",
                registered: false,
                assignedTo: null
            },
            {
                businessName: "Green Grocers",
                ownerName: "Sarah Lee",
                email: "sarah@green.com",
                phoneNumbers: ["5566778899"],
                pincode: "110020",
                category: "Grocery",
                type: "Wholesaler",
                website: "https://greengrocers.net",
                address: "Okhla Industrial Area, Phase 3",
                city: "New Delhi",
                district: "South East Delhi",
                state: "Delhi",
                country: "India",
                registered: false,
                assignedTo: null
            }
        ];
        await Business.insertMany(dummyBusinesses);
        res.status(201).json({ message: "Database seeded!" });
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }
});

module.exports = router;
