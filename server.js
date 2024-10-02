const mongoose = require('mongoose');
const dotenv = require('dotenv');

// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   console.log("UNCAUGHT EXCEPTION");
//   process.exit(1); // Exit process with non-zero status code
// });

dotenv.config({ path: './.env' });

const app = require('./app');

//READ DB URL FROM .env FILE
//SAVE INTO A VARIABLE
const dbURL = process.env.Database_LOCAL;

mongoose
  .connect(dbURL)
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.error(`Mongoose connection error: ${err.message}`);
  });

// START SERVER
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
