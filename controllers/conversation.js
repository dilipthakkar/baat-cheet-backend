const { validationResult } = require("express-validator");
const Conversation = require("../models/conversation");
const User = require("../models/user");
const {
  FormatParticipants,
  getConversationId,
} = require("../utils/helper/conversation.helper");
const _ = require("lodash");

const { handleValidationError } = require("../utils/helper/error.helper");

exports.sendMessageNew = async (req, res) => {
  // initializing socket variable
  const io = req.app.get("io");

  // validating the body of request
  await handleValidationError(req);

  // extract variables
  const { rcvNumber, msgBody, genId } = req.body;
  const user = req.user;
  const msg = {
    body: msgBody,
    sender: user._id,
    timestamp: new Date(),
    genId: genId,
  };

  try {
    // find other user
    const otherUser = await User.findOne({ phoneNo: rcvNumber });
    if (!otherUser) {
      throw new Error("other user not found");
    }
    let conversationId = await getConversationId(rcvNumber, user.phoneNo);
    const conversation = await Conversation.findOne({ conversationId });
    if (conversation) {
      throw new Error(
        "you have already a ongoing conversation with other person"
      );
    }
    const newConversation = await new Conversation({
      participants: [user._id, otherUser._id],
      messages: [msg],
      conversationId,
    }).save();
    if (!newConversation) {
      throw new Error("error in creating conversation");
    }
    user.conversations.push(newConversation._id);
    const updatedUser = user.save();
    otherUser.conversations.push(newConversation._id);
    const updatedOtherUser = otherUser.save();
    if (
      !updatedUser ||
      (updatedUser && updatedUser.error) ||
      !updatedOtherUser ||
      (updatedOtherUser && updatedOtherUser.error)
    ) {
      Conversation.findByIdAndDelete(newConversation._id);
    }
    io.to(`${otherUser.phoneNo}`).emit("new-conversation-rcv");
    return res.status(200).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  // initializing socket variable
  const io = req.app.get("io");

  // validating the body of request
  await handleValidationError(req);

  const { rcvNumber, msgBody, genId } = req.body;
  const user = req.user;

  const msg = {
    body: msgBody,
    sender: user._id,
    timestamp: new Date(),
    genId: genId,
    status: "delivered",
  };
  try {
    const otherUser = await User.findOne({ phoneNo: rcvNumber });
    if (!otherUser) {
      throw new Error("other user not found");
    }
    let conversationId = await getConversationId(rcvNumber, user.phoneNo);
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      throw new Error("Error in finding conversation");
    }
    conversation.messages.push(msg);
    const savedConversation = await conversation.save();
    if (!savedConversation) {
      throw new Error("error in sending message please send a message again");
    }
    io.to(`${otherUser.phoneNo}`).emit("new-message-rcv", { message: msg });
    return res.status(200).send();
  } catch (error) {
    return res.status(400).json({
      isValidExecution: false,
      error: error.message,
    });
  }
};

exports.allConversation = (req, res) => {
  const user = req.user;
  try {
    const conversations = User.findById(user._id)
      .populate({
        path: "conversations",
        model: "Conversation",
        populate: {
          path: "participants",
          model: "",
          select: {
            name: 1,
            profilePic: 1,
            phoneNo: 1,
          },
        },
      })

      .exec(function (err, userDocument) {
        if (err) throw new Error(err);
        userDocument = userDocument.conversations;
        for (let i = 0; i < userDocument.length; i++) {
          const pendingMsgs = userDocument[i].messages.filter(
            (message) => message.status == "pending"
          );
          if (_.isEmpty(pendingMsgs)) {
            userDocument[i].messages = [
              userDocument[i].messages[userDocument[i].messages.length - 1],
            ];
          } else {
            userDocument[i].messages = pendingMsgs;
          }
        }

        for (let i = 0; i < userDocument.length; i++) {
          let otherPerson = null;
          if (userDocument[i].participants[0].phoneNo === user.phoneNo) {
            otherPerson = userDocument[i].participants[1];
          } else {
            otherPerson = userDocument[i].participants[0];
          }
          userDocument[i].participants = undefined;
          const newObj = {};
          _.assign(newObj, userDocument[i]._doc);
          _.assign(newObj, { otherPerson: otherPerson._doc });
          userDocument[i] = newObj;
        }

        return res.status(200).json({ conversations: userDocument });
      });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "error in finding conversation of user" });
  }
};

exports.getConversationById = (req, res) => {
  const user = req.user;

  try {
    const conversationId = req.params.conversationId;
    if (!conversationId)
      throw new Error("conversationId is not present in params");

    const conversation = Conversation.findOne({ _id: conversationId })
      .populate({
        path: "participants",
        model: "User",
        select: {
          name: 1,
          profilePic: 1,
          phoneNo: 1,
        },
      })
      .exec()
      .then((conversationDocument) => {
        if (!conversationDocument)
          throw new Error("error in finding conversation in collection");
        const newObj = {};
        _.assign(newObj, conversationDocument._doc, {
          otherPerson: FormatParticipants(
            conversationDocument._doc.participants,
            user._id
          ),
          participants: undefined,
        });
        return res.status(200).json({ conversation: newObj });
      })
      .catch((err) => {
        console.log(err);
        if (err)
          return res.status(400).json({
            isValidExecution: false,
            error: "error in finding conversation in collection",
          });
      });
  } catch (error) {
    return res
      .status(400)
      .json({ isValidExecution: false, error: error.message });
  }
};

exports.msgSeen = async (req, res) => {
  const io = req.app.get("io");

  try {
    const otherUserPhoneNo = req.body.phoneNo;
    const user = req.user;
    const conversationId = await getConversationId(
      otherUserPhoneNo,
      user.phoneNo
    );
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) throw new Error("error in finding conversation");
    conversation.messages.map((msg) => {
      if (msg.sender.toString() != user._id.toString()) {
        msg.status = "seen";
      }
    });
    const savedconversation = await conversation.save();
    if (!savedconversation) throw new Error("network error");
    io.to(`${otherUserPhoneNo}`).emit("your-msg-seen", {
      id: savedconversation._id,
    });
    return res.status(200).send();
  } catch (error) {
    return res.status(400).json({
      isValidExecution: false,
      error: error.message,
    });
  }
};
