const router = require('express').Router();
const Telecaller = require('../models/Telecaller');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');

// Initialize Cache (StdTTL: 5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

// GET All Staff (Telecallers)
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'staff_list_full';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        // Expose password as requested (INSECURE)
        const staff = await Telecaller.find({ role: 'staff' });

        // Get assignment counts
        const staffWithAssignments = await Promise.all(staff.map(async (s) => {
            const count = await require('../models/Business').countDocuments({ assignedTo: s._id });
            return { ...s._doc, assignments: count };
        }));

        cache.set(cacheKey, staffWithAssignments, 60); // Cache for 60s
        res.status(200).json(staffWithAssignments);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
