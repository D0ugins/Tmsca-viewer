const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  code: { type: String, minlength: 2, maxlength: 32, required: true, trim: true, unique: true },
  created: { type: Date, default: Date.now },
  students: { type: [mongoose.Schema.Types.ObjectId], required: true, default: [] }
});

module.exports = School = mongoose.model("school", schoolSchema)