import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/Config.js";
import authRoute from './Routes/authRouter.js'
import userRoute from './Routes/userRouter.js'
import cookieParser from "cookie-parser";
import postRoute from './Routes/postRouter.js'

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: "true",
  })
);

app.use(express.json());
app.use(cookieParser());

//Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error ";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to Api");
});

//Api routes
 app.use('/api/auth',authRoute);
 app.use('/api/user',userRoute);
 app.use('/api/post',postRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port `);
});
