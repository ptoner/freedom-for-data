const IpfsException = require('./ipfs-exception.js');

class IpfsConnectionException extends IpfsException {

    constructor(ex) {
        super(ex)
        this.name = "IpfsConnectionException"

        // Use V8's native method if available, otherwise fallback
        if ("captureStackTrace" in Error)
            Error.captureStackTrace(ex, IpfsConnectionException);
        else
            this.stack = (ex).stack;
    }


}

module.exports = IpfsConnectionException;