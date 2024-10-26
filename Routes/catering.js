const express = require("express");
const catering = require("../Models/catering");
const Users = require("../Models/userModel.js");
const loginAuth = require("../Middleware/verifyToken.js");
const multer = require("multer");
const cloudinary = require("../cloudinary.js");

const cateringRouter = express.Router();

// Multer setup for handling image uploads
const memory = multer.memoryStorage();
const upload = multer({ storage: memory });

cateringRouter.post(
  "/add",
  // loginAuth,
  // roleAuth("Admin"),
  upload.array("media"),
  async (req, res) => {
    const {
      cateringName,
      cateringDescription,
      cateringAddress,
      cateringCity,
      cateringMenu,
      cateringContact,
      price,
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

      const verifyCatering = await catering.findOne({
        cateringContact: cateringContact,
      });
      if (verifyCatering) {
        return res.status(400).json({ message: "Catering already exists" });
      }
      const newCatering = new catering({
        cateringName,
        cateringDescription,
        cateringAddress,
        cateringCity,
        cateringContact,
        cateringMenu: cateringMenu.split(","),
        cateringImages: mediaUrls.filter(
          (url) => url.endsWith(".jpg") || url.endsWith(".png")
        ),
        price,
      });

      await newCatering.save();
      res.status(200).json({ message: "Catering added successfully" });
    } catch (errors) {
      res.status(500).send({ message: "server error", error: errors });
    }
  }
);
// endpoint to get all the catering

cateringRouter.get("/get", async (req, res) => {
  try {
    const allCaterings = await catering.find({});
    res.status(200).send(allCaterings);
  } catch (err) {
    res.status(500).send({ message: "server error", error: err });
  }
});
// endpoint to book an catering handlers

cateringRouter.post("/book/:id", loginAuth, async (req, res) => {
  const id = req.params.id;
  const { eventDate } = req.body;

  try {
    //To verify the date must not be an past date
    if (new Date(eventDate) <= Date.now()) {
      return res.status(400).send({ message: "Date must not be a past date" });
    }

    // Find the user selected catering
    const selectedCater = await catering.findById({ _id: id });
    const user = await Users.findById(req.user.id);
    const verifyDate = selectedCater.bookedOn.filter((dates) => {
      return dates.date == eventDate;
    });
    //verifying the catering is booked on that date r not
    if (verifyDate.length > 0) {
      return res
        .status(400)
        .send({ message: "catering already booked on that date" });
    }
    //if user has booked a catering then he cannot book the same catering to other date until that day overs
    const verifyUser = selectedCater.bookedOn.filter((user) => {
      return user.user == req.user.id;
    });
    console.log(verifyUser);
    if (verifyUser.length > 0) {
      return res.status(400).send({
        message: "once previous booking is done then only you can book another",
      });
    }

    selectedCater.bookedOn.push({ date: eventDate, user: req.user.id });
    selectedCater.bookedBy.push(req.user.id);
    await selectedCater.save();
    // calculate budget
    user.budgetSpent = selectedCater.price + user.budgetSpent;
    user.budgetLeft = user.budgetLeft - selectedCater.price;
    await user.save();
    res.status(200).send({
      message: "Booked successfully our Admin will contact you shortly",
    });
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});
//endpoint to remove Booking for a particular user
cateringRouter.delete("/remove/:id", loginAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const selectedCater = await catering.findById({ _id: id });
    const user = await Users.findById(req.user.id);

    const verifyDate = selectedCater.bookedOn.filter((dates) => {
      return dates.user !== req.user.id;
    });
    const resetUser = selectedCater.bookedBy.filter((id) => {
      return id !== req.user.id;
    });
    console.log(verifyDate);
    selectedCater.$set({ bookedOn: verifyDate, bookedBy: resetUser });
    await selectedCater.save();

    // calculate budget
    user.budgetSpent = user.budgetSpent - selectedCater.price;
    user.budgetLeft = user.budgetLeft + selectedCater.price;
    await user.save();

    res.status(200).send({ message: "remove booking successfully" });
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});
cateringRouter.get("/dashboard", loginAuth, async (req, res) => {
  try {
    const userBookings = await catering.find({
      "bookedOn.user": req.user.id,
    });
    res.status(200).send(userBookings);
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});
//endpoint to get particular Catering by ID
cateringRouter.get("/get/:id", async (req, res) => {
  try {
    const catering = await catering.findById(req.params.id);
    if (!catering) {
      return res.status(404).send({ message: "Catering not found" });
    }
    res.status(200).send(catering);
  } catch (err) {
    res.status(500).send({ message: "Server error: " + err.message });
  }
});

module.exports = cateringRouter;
