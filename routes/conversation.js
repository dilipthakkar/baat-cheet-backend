const express = require("express");
const { check } = require("express-validator");
const { isAuthenticate } = require("../controllers/auth");
const {
  sendMessageNew,
  allConversation,
  getConversationById,
  sendMessage,
  msgSeen,
} = require("../controllers/conversation");
const router = express.Router();

router.post(
  "/p2p/sendmessage/new",
  [
    check("rcvNumber")
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage("phone number is not valid"),
    check("msgBody")
      .isLength({ min: 1 })
      .withMessage("message can not be empty"),
  ],
  check("genId").isLength({ min: 1 }).withMessage("genId can not be empty"),

  isAuthenticate,
  sendMessageNew
);

router.post(
  "/p2p/sendmessage",
  [
    check("rcvNumber")
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage("phone number is not valid"),
    check("msgBody")
      .isLength({ min: 1 })
      .withMessage("message can not be empty"),
    check("genId").isLength({ min: 1 }).withMessage("genId can not be empty"),
  ],
  isAuthenticate,
  sendMessage
);

router.post("/p2p/msgseen", isAuthenticate, msgSeen);

router.get("/p2p/allconversation", isAuthenticate, allConversation);
router.get(
  "/p2p/getConversationById/:conversationId",
  isAuthenticate,
  getConversationById
);

module.exports = router;
