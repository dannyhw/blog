class HTTPResponseError extends Error {
  constructor(response, customMessage, ...args) {
    super(
      `${customMessage}: ${response.status} ${response.statusText}`,
      ...args
    );
    this.response = response;
  }
}

module.exports = { HTTPResponseError };
