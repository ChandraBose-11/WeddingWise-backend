const mongoose = require("mongoose");

const cateringSchema = new mongoose.Schema({
  cateringName: {
    type: String,
    required: true,
  },
  cateringDescription: {
    type: String,
    required: true,
  },
  cateringImages: {
    type: [String],
  },
  cateringAddress: {
    type: String,
    required: true,
  },
  cateringCity: {
    type: String,
    required: true,
  },
  cateringContact: {
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
  cateringMenu: {
    type: [String],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const catering = mongoose.model("catering", cateringSchema);

module.exports = catering;