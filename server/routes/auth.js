const router = require('express').Router();
const Telecaller = require('../models/Telecaller');
// const bcrypt = require('bcryptjs'); // Removed for plain text storage
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, pincode, password, role } = req.body;

        // Check user exists
        const userExists = await Telecaller.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Create user with PLAIN TEXT password
        const newUser = new Telecaller({
            name,
            email,
            phone,
            pincode,
            password: password, // Storing directly
            role: role || 'staff' // Default to staff
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await Telecaller.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Direct comparison for PLAIN TEXT password
        const validPassword = req.body.password === user.password;
        if (!validPassword) return res.status(400).json({ message: 'Wrong credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, pincode: user.pincode }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, token });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
