const express = require("express");
const path = require("path");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");

// START APP
const app = express();

//DEVELOPMENT LOGGING
if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}
//BODY PARSER
app.use(express.json());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.use("/", userRouter);
app.use("/api/v1/users", userRouter);
module.exports = app;
