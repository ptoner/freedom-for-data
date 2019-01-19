class IpfsException extends Error {

    constructor(message) {
        super(message)
        this.name = "IpfsException"

        // Use V8's native method if available, otherwise fallback
        if ("captureStackTrace" in Error)
            Error.captureStackTrace(this, IpfsException);
        else
            this.stack = (new Error()).stack;
    }

}

module.exports = IpfsException;