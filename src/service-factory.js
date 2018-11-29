const RecordService = require('./record-service.js');
const DataAccessService = require('./data-access-service.js');
const IPFSService = require('./ipfs-service.js');



class ServiceFactory {
    constructor(recordService, ipfs) {

        //Contract dependency
        this.RecordService = recordService;

        //Initialize IPFS connection.
        this.ipfs = ipfs;

    }

    initializeRecordService(recordServiceContract) {
        this.recordService = new RecordService(recordServiceContract);

        return this.recordService;
    }

    initializeIpfsService() {
        this.ipfsService = new IPFSService(this.ipfs);

        return this.ipfsService;
    }

    initializeDataAccessService() {
        this.initializeIpfsService();
        this.dataAccessService = new DataAccessService(this.recordService, this.ipfsService);

        return this.dataAccessService;
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

    getDataAccessService() {
        return this.dataAccessService;
    }

}



module.exports = ServiceFactory;