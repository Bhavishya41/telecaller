const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: false,
    },
    ownerName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phoneNumbers: {
        type: [String], // Array of strings for multiple numbers
        required: false,
    },
    pincode: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false, // e.g., IT, electronics, automobile
    },
    type: {
        type: [String], // e.g., ['Retailer', 'Wholesaler']
        default: [],
    },
    website: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    district: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    registered: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Telecaller',
        default: null
    },
    assignmentMessage: {
        type: String,
        default: ""
    },
    followup: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
