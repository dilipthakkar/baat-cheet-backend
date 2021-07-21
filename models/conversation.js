const mongoose = require("mongoose");
const User = require("./user");
const { P2P } = require("../utils/strings");
const conversationSchmea = mongoose.Schema({
  participants: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      body: {
        type: String,
        required: true,
      },
      sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        require: true,
        default: "delivered",
      },
      senderGenId: {
        type: String,
        require: true,
      },
      timestamp: Date,
    },
  ],
  conversationId: {
    type: "String",
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    default: P2P,
  },
});

const model = mongoose.model("Conversation", conversationSchmea);
module.exports = model;
