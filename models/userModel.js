const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, minlength: 2, maxlength: 32, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    created: { type: Date, default: Date.now },
    school: { type: String, minlength: 2, maxlength: 32 },
    competitions: {
        NS: { type: Boolean, default: false },
        MA: { type: Boolean, default: false },
        SC: { type: Boolean, default: false },
        CA: { type: Boolean, default: false },
    }
});

module.exports = User = mongoose.model("user", userSchema)