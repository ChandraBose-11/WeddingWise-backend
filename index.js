const express = require("express");
const cors = require("cors");
require("dotenv").config()
const authRoute = require("./Routes/authRouter.js");
const userRoute = require("./Routes/userRouter.js");
const cookieParser = require("cookie-parser");
const mallsRouter = require("./Routes/malls.js");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cateringRouter = require("./Routes/catering.js")
const app = express();

app.use(
  cors()
);

// app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Error handler
// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal Server Error ";
//   res.status(statusCode).json({
//     success: false,
//     statusCode,
//     message,
//   });
// });



//Api routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/malls", mallsRouter);
app.use("/api/catering",cateringRouter)
//routes

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Database Connected");
app.listen("5000", () => {
   console.log("Server is running on port 5000");
  });
});
