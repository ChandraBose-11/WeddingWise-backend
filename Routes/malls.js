const express =require("express")
const malls=require("../Models/malls")
const Users = require("../Models/userModel.js");
const loginAuth = require('../Middleware/verifyToken.js')
const multer = require("multer");
const cloudinary=require("../cloudinary.js")
const roleAuth = require("../Middleware/roleAuth.js")

const mallsRouter = express.Router();

// Multer setup for handling image uploads
const memory = multer.memoryStorage();
const upload = multer({ storage: memory });

mallsRouter.post(
    "/add",
    // loginAuth,
    // roleAuth("Admin"),
    upload.array("media"),
    async (req, res) => {
      const {
        mallName,
        mallAddress,
        mallCity,
        mallDescription,
        mallContact,
        spacing,
        amenities,
        Price,
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
  
        const verify = await malls.findOne({ mallContact: mallContact});
        if (verify) {
          return res.status(400).send({ message: "Mall already exists" });
        }
        const newMall = new malls({
          mallName,
          mallAddress,
          mallCity,
          mallDescription,
          mallImages: mediaUrls.filter(
            (url) => url.endsWith(".jpg") || url.endsWith(".png")
          ),
          mallContact,
          spacing,
          amenities: amenities.split(","),
          Price,
        });
        await newMall.save();
        res.status(200).send({ message: "Mall registered successfully" });
      } catch (err) {
        res.status(500).send({ message: "server error: ", err: err.message });
      }
    }
  );

  //Endpoint to get the mall

mallsRouter.get("/get", async (req, res) => {
  try {
    const allMalls = await malls.find({});
    res.status(200).send(allMalls);
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});

//endpoint to book the mall

mallsRouter.post("/book/:id",loginAuth, async (req, res) => {
  const id = req.params.id;
  const { eventDate } = req.body;
  console.log(eventDate);
  try {
    //To verify the date must not be an past date
    if (new Date(eventDate) <= Date.now()) {
      return res.status(400).send({ message: "Date must not be a past date" });
    }

    // Find the user selected mall
    const selectedMall = await malls.findById({ _id: id });
    const user = await Users.findById(req.user.id);

    const verifyDate = selectedMall.bookedOn.filter((dates) => {
      return dates.date == eventDate;
    });
    //verifying the mall is booked on that date r not
    if (verifyDate.length > 0) {
      return res
        .status(400)
        .send({ message: "Mall already booked on that date" });
    }
  

    // calculate budget
    user.budgetSpent = selectedMall.Price + user.budgetSpent;
    user.budgetLeft = user.budgetLeft - selectedMall.Price;
    await user.save();
    selectedMall.bookedOn.push({ date: eventDate, user: req.user.id });
    selectedMall.bookedBy.push(req.user.id);
    await selectedMall.save();

    res.status(200).send({
      message: "Booked successfully our Admin will contact you shortly",
      mallId: selectedMall._id,
    });
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});
//endpoint to remove Booking for a particular user
mallsRouter.delete("/remove/:id", loginAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const selectedMall = await malls.findById({ _id: id });
    const user = await Users.findById(req.user.id);

    const verifyDate = selectedMall.bookedOn.filter((dates) => {
      return dates.user !== req.user.id;
    });
    const resetUsers = selectedMall.bookedBy.filter((id) => {
      return id !== req.user.id;
    });
    console.log(verifyDate);
    selectedMall.$set({ bookedOn: verifyDate, bookedBy: resetUsers });
    await selectedMall.save();

    // calculate budget
    user.budgetSpent = user.budgetSpent - selectedMall.Price;
    user.budgetLeft = user.budgetLeft + selectedMall.Price;
    await user.save();
    res.status(200).send({ message: "remove booking successfully" });
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});
// endpoint to show particular user bookings for dashboard

mallsRouter.get("/dashboard", loginAuth, async (req, res) => {
  try {
    const userBookings = await malls.find({
      "bookedOn.user": req.user.id,
    });
    res.status(200).send(userBookings);
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});
// endpoint to get particular Mall by ID

mallsRouter.get("/get/:id", async (req, res) => {
  try {
    const mall = await malls.findById(req.params.id);
    if (!mall) return res.status(404).send({ message: "Mall not found" });

    res.status(200).send(mall);
  } catch (err) {
    res.status(500).send({ message: "server error: ", err: err.message });
  }
});

mallsRouter.put(
  "/edit/:id",
  // loginAuth,
  // roleAuth("Admin"),
  upload.array("media"),
  async (req, res) => {
    const { id } = req.params;
    const {
      mallName,
      mallAddress,
      mallCity,
      mallDescription,
      mallContact,
      spacing,
      amenities,
      Price,
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

      const verify = await malls.findOne({
        mallContact: mallContact,
      });
      console.log(verify._id.toString());
      console.log(id);
      if (verify) {
        if (verify._id.toString() !== id) {
          return res
            .status(400)
            .send({ message: "contact already used in some vendors" });
        }
      }
      const updatedMall = await malls.findByIdAndUpdate(
        id,
        {
          mallName,
          mallAddress,
          mallCity,
          mallContact,
          mallDescription,
          spacing,
          amenities: amenities.split(","),
          mallImages: mediaUrls.filter(
            (url) => url.endsWith(".jpg") || url.endsWith(".png")
          ),
          Price,
        },
        { new: true, runValidators: true }
      );

      return res
        .status(200)
        .send({ message: "update successfully", data: updatedMall });
    } catch (e) {
      return res
        .status(400)
        .send({ message: "Update failed", data: e.message });
    }
  }
);
mallsRouter.delete(
  "/delete/:id",
  loginAuth,
  roleAuth("Admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const mall = await malls.findByIdAndDelete(id);
      console.log(mall);
      if (!mall) return res.status(404).send({ message: "Mall not found" });
      res.status(200).send({ message: "Mall deleted successfully" });
    } catch (e) {
      return res
        .status(500)
        .send({ message: "Delete failed", data: e.message });
    }
  }
);

  module.exports = mallsRouter;