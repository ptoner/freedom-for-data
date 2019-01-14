function IpfsException(message) {
    this.message = message;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, IpfsException);
    else
        this.stack = (new Error()).stack;
}

IpfsException.prototype = Object.create(Error.prototype);
IpfsException.prototype.name = "IpfsException";
IpfsException.prototype.constructor = IpfsException;

module.exports = IpfsException;