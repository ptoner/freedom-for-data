class Web3Exception extends Error {

    constructor(message) {
        super(message)
        this.name = "Web3Exception"

        // Use V8's native method if available, otherwise fallback
        if ("captureStackTrace" in Error)
            Error.captureStackTrace(this, Web3Exception);
        else
            this.stack = (new Error()).stack;
    }

}



module.exports = Web3Exception;