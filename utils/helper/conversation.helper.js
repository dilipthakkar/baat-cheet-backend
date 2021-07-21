const _ = require("lodash");
const FormatParticipants = (participants, userId) => {
  if (!_.isUndefined(participants) && _.isEmpty(participants)) return {};
  if (participants.length === 1) return participants[0];
  participants = participants.filter(
    (participant) => participant._id.toString() != userId.toString()
  );
  return participants[0];
};

const getConversationId = (rcvNumber, userNumber) => {
  return new Promise((resolve, reject) => {
    if (!rcvNumber || !userNumber) {
      reject({ message: "unknown error in getting conversation Id" });
    }
    if (rcvNumber == userNumber) {
      reject({ message: "why are you so alone" });
    }
    if (rcvNumber < userNumber) {
      resolve(rcvNumber + userNumber);
    } else {
      resolve(userNumber + rcvNumber);
    }
  });
};

module.exports = {
  FormatParticipants,
  getConversationId,
};
