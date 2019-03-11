const RecordService = require('./record-service.js');
const FreedomService = require('./freedom-service.js');
const IPFSService = require('./ipfs-service.js');



class ServiceFactory {

    constructor(contract, ipfs) {
        this.contract = contract
        this.ipfs = ipfs

        this.initialize(contract, ipfs)

    }

    initialize(contract, ipfs) {
        this.recordService = new RecordService(contract)
        this.ipfsService = new IPFSService(ipfs)
        this.freedomService = new FreedomService(this.recordService, this.ipfsService)
    }

    /**
     * Only giving getters to the actual services to expose
     */

    getRecordService() {
        return this.recordService
    }

    getIpfsService() {
        return this.ipfsService
    }

    getFreedomService() {
        return this.freedomService
    }

}



module.exports = ServiceFactory;