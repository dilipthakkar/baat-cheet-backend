#!/usr/bin/env node

//* arguments from script
const [, , arg, phone1, phone2] = process.argv;

const User = require("../../models/user");
const Conversation = require("../../models/conversation");
const { handleMongoError } = require("../../utils/helper/error.helper");
const { readfileAndSendBuffer } = require("../../utils/imageOptimization");
const path = require("path");
require("dotenv").config();

require("../../utils/mongoConnection");
const users = [
  {
    name: "A",
    email: "a@gmail.com",
    phoneNo: "1234567890",
    password: "123456",
    profilePic:
      "https://firebasestorage.googleapis.com/v0/b/real-chat-app-f5075.appspot.com/o/userImage%2FA.png?alt=media&token=e7db8330-758a-4024-99e3-c392b51031a7",
  },
  {
    name: "B",
    email: "b@gmail.com",
    phoneNo: "1234567891",
    password: "123456",
    profilePic:
      "https://firebasestorage.googleapis.com/v0/b/real-chat-app-f5075.appspot.com/o/userImage%2FB.png?alt=media&token=d37e1747-24c7-4c55-ba9c-f2997a1c5237",
  },
  {
    name: "C",
    email: "c@gmail.com",
    phoneNo: "1234567892",
    password: "123456",
    profilePic:
      "https://firebasestorage.googleapis.com/v0/b/real-chat-app-f5075.appspot.com/o/userImage%2FC.png?alt=media&token=0a51c5d0-9d2b-457c-b2b1-5a52fc06771b",
  },
  {
    name: "D",
    email: "d@gmail.com",
    phoneNo: "1234567893",
    password: "123456",
    profilePic:
      "https://firebasestorage.googleapis.com/v0/b/real-chat-app-f5075.appspot.com/o/userImage%2FD.png?alt=media&token=5abcd965-b773-4a8f-889a-7710f5adf0ae",
  },
];

// * add mentioned users to db
const addUsers = async () => {
  // await users.forEach(async(user)=>{
  //     const bufferResult = await readfileAndSendBuffer(path.join(__dirname ,user.profilePic)) ;
  //     user.profilePic = bufferResult.data ;
  // });

  const result = await User.insertMany(users).catch((error) => {
    error;
  });
  if (result?.error) {
    console.log("error in insertind documents in users");
  } else {
    console.log("all users added");
  }
};

// * send msg from user1 to user2
const sendHii = async (user1, user2) => {
  const firstUser = await User.findOne({ phoneNo: user1.phoneNo }).catch(
    (error) => {
      error;
    }
  );
  const secondUser = await User.findOne({ phoneNo: user2.phoneNo }).catch(
    (error) => {
      error;
    }
  );
  const msg = {
    body: "Hii",
    sender: firstUser._id,
    timestamp: new Date(),
  };

  const conversation = Conversation({
    messages: [msg],
    participants: [firstUser._id, secondUser._id],
    conversationId:
      firstUser.phoneNo < secondUser.phoneNo
        ? firstUser.phoneNo + secondUser.phoneNo
        : secondUser.phoneNo + firstUser.phoneNo,
  });
  const savedConversation = await conversation.save().catch((error) => {
    error;
  });
  if (!savedConversation || (savedConversation && savedConversation.error)) {
    console.log(
      `error while saving conversation for ${firstUser.phoneNo}  ${secondUser.phoneNo}`
    );
  }
  firstUser.conversations.push(savedConversation._id);
  secondUser.conversations.push(savedConversation._id);
  await firstUser.save().catch((error) => {
    error;
  });
  await secondUser.save().catch((error) => {
    error;
  });

  console.log(`conversation ${firstUser.phoneNo} ${secondUser.phoneNo}`);
};

// * start conversations between all of the demo users
const addMessages = () => {
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      console.log(i, j);
      console.log(users[i].phoneNo, users[j].phoneNo);
      sendHii(users[i], users[j]);
    }
  }
};

// * clear conversations of all users
const emptyMsg = () => {
  User.updateMany({ $set: { conversations: [] } }, (err, object) => {
    if (err) {
      console.log("error in updatind all conversations");
    } else {
      console.log("all conversation deleted");
    }
  });
  Conversation.remove((err, object) => {});
};

// * clear conversations of all two mentioned users
const clearConversation = async (phone1, phone2) => {
  const firstUser = await User.findOne({ phoneNo: phone1 }).catch((error) => {
    error;
  });
  const secondUser = await User.findOne({ phoneNo: phone2 }).catch((error) => {
    error;
  });
  const conversationId =
    firstUser.phoneNo < secondUser.phoneNo
      ? firstUser.phoneNo + secondUser.phoneNo
      : secondUser.phoneNo + firstUser.phoneNo;
  const conversation = await Conversation.findOne({ conversationId }).catch(
    (error) => {
      error;
    }
  );
  if (!conversation || (conversation && conversation.error)) {
    return console.log("error in deleting conversation of both users");
  }
  firstUser.conversations.filter((cnv) => cnv === conversation.id);
  secondUser.conversations.filter((cnv) => cnv === conversation.id);
  await Conversation.findByIdAndRemove(conversation.id).catch((error) => {
    error;
  });
  await firstUser.save().catch((error) => {
    error;
  });
  await secondUser.save().catch((error) => {
    error;
  });
  console.log("successfuly delete conversation of both users");
};

// * call a function accordingly script arguments
const setUp = async () => {
  switch (arg) {
    case "addusers":
      await addUsers();
      break;

    case "addusers-msg":
      await addUsers();
      await addMessages();
      break;

    case "empty-msg":
      await emptyMsg();
      break;

    case "clear-conversation":
      await clearConversation(phone1, phone2);
      break;

    default:
      break;
  }
};
setUp();
