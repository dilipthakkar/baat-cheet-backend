require("dotenv").config();
const User = require("../../models/user");
const Conversation = require("../../models/conversation");
const mongoose = require("mongoose");
const URI = process.env.MONGO_URI_LOCAL;

// * clean up all the collection of the database
const cleanUp = async () => {
  User.remove({}, function (err) {
    console.log("User removed");
  });

  Conversation.remove({}, function (err) {
    console.log("Conversation removed");
  });
};

// * connect to database and call cleanUp function
mongoose.connect(
  URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    cleanUp();
  }
);
