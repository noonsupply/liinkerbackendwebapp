const ErrorMessages = {
  MISSING_FIELDS: "Missing or empty fields",
  USER_EXISTS: "User already exists",
  JWT_ERROR: "Error generating JWT",
  SERVER_ERROR: "Server error",
  USER_NOT_FOUND: "User not found or wrong password",
};

const HttpStatus = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = { ErrorMessages, HttpStatus };
