const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
    },
    ownerName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumbers: {
        type: [String], // Array of strings for multiple numbers
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true, // e.g., IT, electronics, automobile
    },
    type: {
        type: String, // e.g., retailer, wholesaler, distributor
        required: true,
    },
    website: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
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
