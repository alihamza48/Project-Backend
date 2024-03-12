class HttpError extends Error {
  constructor(message, errorcode) {
    super(message); //Adds a message property
    this.code = errorcode; //Adds a code property
  }
}
module.exports = HttpError;
