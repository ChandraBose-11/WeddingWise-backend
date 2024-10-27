const express = require("express");
const loginAuth= require("../Middleware/verifyToken")
const DJ=require("../Models/dj")
const Users = require("../Models/userModel")
const multer = require("multer");
const cloudinary = require("../cloudinary");

const djRouter=express.Router();

//Multer setup for handling image uploads
const memory = multer.memoryStorage();
const upload = multer({ storage: memory });

djRouter.post(
    "/add",
    // loginAuth,
    // roleAuth("Admin"),
    upload.array("media"),
    async (req, res) => {
      const {
        djName,
        djDescription,
        djAddress,
        djCity,
        djContact,
        price,
        musicType,
      } = req.body;
  
      try {
        //Upload image to cloudinary
        const mediaUrls = await Promise.all(
          req.files.map(async (file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  resource_type: "auto",
                  upload_preset: "Unsigned",
                },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result.secure_url);
                }
              );
              uploadStream.end(file.buffer);
            });
          })
        );
  
        const verifyDJ = await DJ.findOne({
          djContact: djContact,
        });
        if (verifyDJ) {
          return res.status(400).json({ message: "DJ already exists" });
        }
        const newDJ = new DJ({
          djName,
          djDescription,
          djAddress,
          djCity,
          djContact,
          musicType: musicType.split(","),
          djImages: mediaUrls.filter(
            (url) => url.endsWith(".jpg") || url.endsWith(".png")
          ),
          price,
        });
  
        await newDJ.save();
        res.status(200).json({ message: "DJ added successfully" });
      } catch (errors) {
        res.status(500).send({ message: "server error", error: errors });
      }
    }
  );
// endpoint to get all the DJ

djRouter.get("/get", async (req, res) => {
    try {
      const allDJ = await DJ.find({});
      res.status(200).send(allDJ);
    } catch (err) {
      res.status(500).send({ message: "server error", error: err });
    }
  });
  // endpoint to book an DJ handlers

djRouter.post("/book/:id", loginAuth, async (req, res) => {
    const id = req.params.id;
    const { eventDate } = req.body;
  
    try {
      //To verify the date must not be an past date
      if (new Date(eventDate) <= Date.now()) {
        return res.status(400).send({ message: "Date must not be a past date" });
      }
  
      // Find the user selected catering
      const selectedDJ = await DJ.findById({ _id: id });
      const user = await Users.findById(req.user.id);
      const verifyDate = selectedDJ.bookedOn.filter((dates) => {
        return dates.date == eventDate;
      });
      //verifying the catering is booked on that date r not
      if (verifyDate.length > 0) {
        return res
          .status(400)
          .send({ message: "DJ already booked on that date" });
      }
      //if user has booked a catering then he cannot book the same catering to other date until that day overs
      const verifyUser = selectedDJ.bookedOn.filter((user) => {
        return user.user == req.user.id;
      });
      console.log(verifyUser);
      if (verifyUser.length > 0) {
        return res.status(400).send({
          message: "once previous booking is done then only you can book another",
        });
      }
  
      selectedDJ.bookedOn.push({ date: eventDate, user: req.user.id });
      selectedDJ.bookedBy.push(req.user.id);
      // calculate budget
      user.budgetSpent = selectedDJ.price + user.budgetSpent;
      user.budgetLeft = user.budgetLeft - selectedDJ.price;
      await user.save();
      await selectedDJ.save();
  
      res.status(200).send({
        message: "Booked successfully our Admin will contact you shortly",
      });
    } catch (err) {
      res.status(500).send({ message: "server error: ", err: err.message });
    }
  });
  //endpoint to remove Booking for a particular user
djRouter.delete("/remove/:id", loginAuth, async (req, res) => {
    const id = req.params.id;
  
    try {
      const selectedDJ = await DJ.findById({ _id: id });
      const user = await Users.findById(req.user.id);
  
      const verifyDate = selectedDJ.bookedOn.filter((dates) => {
        return dates.user !== req.user.id;
      });
      const resetUser = selectedDJ.bookedBy.filter((user) => {
        return user !== req.user.id;
      });
      console.log(verifyDate);
      selectedDJ.$set({ bookedOn: verifyDate, bookedBy: resetUser });
      // calculate budget
      user.budgetSpent = user.budgetSpent - selectedDJ.price;
      user.budgetLeft = user.budgetLeft + selectedDJ.price;
      await user.save();
  
      await selectedDJ.save();
      res.status(200).send({ message: "remove booking successfully" });
    } catch (err) {
      res.status(500).send({ message: "server error: ", err: err.message });
    }
  });
  // endpoint to show particular user bookings for dashboard

djRouter.get("/dashboard", loginAuth, async (req, res) => {
    try {
      const userBookings = await DJ.find({
        "bookedOn.user": req.user.id,
      });
      res.status(200).send(userBookings);
    } catch (err) {
      res.status(500).send({ message: "server error: ", err: err.message });
    }
  });
//endpoint to show particular dj by ID

djRouter.get("/get/:id", async (req, res) => {
    try {
      const dj = await DJ.findById(req.params.id);
      res.status(200).send(dj);
    } catch (err) {
      res.status(500).send({ message: "server error: ", err: err.message });
    }
  });  
  module.exports = djRouter;