const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, minlength: 2, maxlength: 32, required: true },
    lastName: { type: String, minlength: 2, maxlength: 32, required: true },
    created: { type: Date, default: Date.now },
    competitions: {
        NS: { type: Boolean, default: false },
        MA: { type: Boolean, default: false },
        SC: { type: Boolean, default: false },
        CA: { type: Boolean, default: false },
    }
});

module.exports = User = mongoose.model("user", userSchema)