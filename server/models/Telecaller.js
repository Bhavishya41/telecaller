const mongoose = require('mongoose');

const TelecallerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff'
    }
}, { timestamps: true });

module.exports = mongoose.model('Telecaller', TelecallerSchema);
