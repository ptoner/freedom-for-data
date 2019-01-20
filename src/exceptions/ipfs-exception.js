class IpfsException extends Error {

    constructor(ex) {
        super(ex.message)
        this.name = "IpfsException"

        // Use V8's native method if available, otherwise fallback
        if ("captureStackTrace" in Error)
            Error.captureStackTrace(this, IpfsException);
        else
            this.stack = (ex).stack;
    }

}

module.exports = IpfsException;