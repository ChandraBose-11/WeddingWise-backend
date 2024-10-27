const mongoose = require("mongoose");

const djSchema = new mongoose.Schema({
  djName: {
    type: String,
    required: true,
  },
  djImages: {
    type: [String],
  },
  djDescription: {
    type: String,
    required: true,
  },
  djAddress: {
    type: String,
    required: true,
  },
  djCity: {
    type: String,
    required: true,
  },
  djContact: {
    type: String,
    required: true,
  },
  musicType: {
    type: [String],
    required: true,
  },
  bookedOn: {
    //both dates and user
    type: [Object],
    default: [],
  },
  bookedBy: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
  },
});

const DJ = mongoose.model("DJ", djSchema);

module.exports = DJ;