// import express from "express";
//import mongoose from "mongoose";
// import dotenv from "dotenv";

// import connectDB from "./db/db.js";

// // require("dotenv").config({ path: "./env" });

// dotenv.config({
//   path: "./env",
// });

// // const app = express();

// connectDB();

/*
(async () => {
  try {
    await mongoose.connect(
      `connection database ${process.env.MONGODB_URL}${DB_NAME}`
    );

    app.on("error", (error) => {
      console.log("Mongoose connection error", error);
    });

    app.listen(PORT, () => {
      console.log(`SERVER IS RUNNING ON ${PORT}`);
    });
  } catch (error) {
    console.error("error:", error);
  }
})();

*/

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

dotenv.config({
  path: "./.env",
});

const app = express();
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongoose Connection Error", error);
  });
