const mongoose = require("mongoose");

const mallsSchema = new mongoose.Schema({
  mallName: {
    type: String,
    required: true,
  },
  mallImages: {
    type: [String],
  },
  mallAddress: {
    type: String,
    required: true,
  },
  mallCity: {
    type: String,
    required: true,
  },
  mallContact: {
    type: String,
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
  spacing: {
    type: String,
    default: "500-1000",
  },
  amenities: {
    type: Array,
    default: [],
  },
  Price: {
    type: Number,
    default: 20000,
  },
});

const Malls = mongoose.model("Malls", mallsSchema);

module.exports = Malls;