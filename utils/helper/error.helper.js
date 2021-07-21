const { validationResult } = require("express-validator");

const handleValidationError = (req) => {
  const errors = validationResult(req).array();
  return new Promise((resolve, reject) => {
    if (errors.length > 0) {
      reject({ error: errors[0].msg });
    } else resolve("");
  });
};

module.exports = {
  handleValidationError,
};
