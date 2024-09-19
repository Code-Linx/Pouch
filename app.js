const express = require("express");
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

//ROUTES
app.use("/", userRouter);
app.use("/api/v1/users", userRouter);
module.exports = app;
