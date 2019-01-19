const IpfsException = require('./ipfs-exception.js');

class IpfsConnectionException extends IpfsException {

    constructor(ex) {
        super(ex)
        this.name = "IpfsConnectionException"
    }


}

module.exports = IpfsConnectionException;