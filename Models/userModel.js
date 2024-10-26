const mongoose =require ("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    budget: {
      type: Number,
      default: 0,
    },
    budgetLeft: {
      type: Number,
      default: 0,
    },
    budgetSpent: {
      type: Number,
      default: 0,
    },
    resetCode: {
      type: String,
      default: null,
    },
  
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
 
);

const User = mongoose.model("User", userSchema);
module.exports=User
