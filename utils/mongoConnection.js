const mongoose = require("mongoose");
const URI = process.env.MONGO_URI_LOCAL;
mongoose.connect(
  URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log("connected to mongodb");
  }
);
