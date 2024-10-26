const User =require ("../Models/userModel.js");
const  errorHandler  =require ("../Utils/Error.js");
const bcryptjs =require ("bcryptjs");
const jwt =require ("jsonwebtoken");
require("dotenv").config()



 const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log(req.body);
  
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All the Fields Are Required"));
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res
      .status(200)
      .json({ message: "User Registered Successfully", result: newUser });
  } catch (error) {
    next(error);
  }
};

 const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  
  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All the Fields Are Required"));
  }
  try {
    const userDetail = await User.findOne({ email });
    const userPassword = bcryptjs.compareSync(password, userDetail.password);
    if (!userDetail || !userPassword) {
      return next(errorHandler(400, "Invalid Credentials"));
    }
    const token = jwt.sign(
      {
        username: userDetail.username,
        id: userDetail._id,
        role: userDetail.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    )

    const { password: passkey, ...rest } = userDetail._doc;

    res
      .status(200)
      .json({ message: "User LoggedIn Successfully", rest, token });
  } catch (error) {
    next(error);
  }
};

// Google firebase

 const google = async (req, res) => {
  const { email, name, profilePic } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);

      const { password: passkey, ...rest } = user._doc;

      res
        .status(200)
        .json({
          message: "User LoggedIn Successfully using Google",
          rest,
          token,
        });
    } else {
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: profilePic,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY);

      const { password: passkey, ...rest } = newUser._doc;

      res
        .status(200)
        .json({
          message: "User LoggedIn Successfully using Google",
          rest,
          token,
        });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error in Login User" });
  }
};
const Auths={registerUser:registerUser,loginUser:loginUser,google:google}
module.exports=Auths