const RecordService = require('./record-service.js');
const DataService = require('./data-service.js');
const IPFSService = require('./ipfs-service.js');



class ServiceFactory {

    constructor(recordServiceContract, ipfs) {
        this.recordServiceContract = recordServiceContract;
        this.ipfs = ipfs;

        this.initialize(recordServiceContract, ipfs);

    }

    initialize(recordServiceContract, ipfs) {
        this.recordService = new RecordService(recordServiceContract);
        this.ipfsService = new IPFSService(ipfs);
        this.dataService = new DataService(this.recordService, this.ipfsService);
    }

    /**
     * Only giving getters to the actual services to expose
     */

    getRecordService() {
        return this.recordService;
    }

    getIpfsService() {
        return this.ipfsService;
    }

    getDataService() {
        return this.dataService;
    }

}



module.exports = ServiceFactory;