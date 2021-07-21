const mongoose = require("mongoose");
const Conversation = require("./conversation");
const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNo: {
    type: String,
    unique: true,
  },
  profilePic: {
    type: String,
  },
  password: {
    type: String,
  },
  conversations: [{ type: mongoose.Types.ObjectId, ref: "Conversation" }],
});

userSchema.methods.checkPassword = function (password) {
  return this.password == password;
};
const Model = mongoose.model("User", userSchema);
module.exports = Model;
