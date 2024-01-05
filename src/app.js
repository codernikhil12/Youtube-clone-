import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// directly json data  pass korar jonno express.json use kora hoi
app.use(express.json({ limit: "20kb" }));

// urlencoded means amr je kno url thekhe data aste pare sei jonno special vabe middleware r maddyeme select korte hoi
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// express static means akhane photo vdo ba pdf store korar jonno static use hoi

app.use(express.static("public"));

// cokie-parser use ho66e server r cookie gulo ke read & Update kora
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";

// router decalration
app.use("/api/v1/users", userRouter);

export {app};

//middleware
//jakhn amer kno url a req send kori seta jakhan res amr amader kache ache tar majhe kichu checking hoi seta ke middleware bole
