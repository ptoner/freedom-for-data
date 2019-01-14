function Web3Exception(message) {
    this.message = message;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, Web3Exception);
    else
        this.stack = (new Error()).stack;
}

Web3Exception.prototype = Object.create(Error.prototype);
Web3Exception.prototype.name = "Web3Exception";
Web3Exception.prototype.constructor = Web3Exception;

module.exports = Web3Exception;