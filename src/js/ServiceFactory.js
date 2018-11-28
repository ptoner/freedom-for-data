class ServiceFactory {
    constructor(recordService, ipfsServiceJs, recordServiceJs, dataAccessServiceJs, multihash,
                utils, testUtils, ipfs
        ) {

        //Contract dependencies
        this.RecordService = recordService;

        //Javascript dependencies
        this.IPFSServiceJs = ipfsServiceJs;
        this.RecordServiceJs = recordServiceJs;
        this.DataAccessServiceJs = dataAccessServiceJs;
        this.multihash = multihash;

        this.utils = utils;
        this.testUtils = testUtils;

        //Initialize IPFS connection. Needs to be running locally.
        this.ipfs = ipfs;

    }

    initializeRecordService(recordServiceContract) {
        this.recordService = new this.RecordServiceJs(recordServiceContract);

        return this.recordService;
    }

    initializeIpfsService() {
        this.ipfsService = new this.IPFSServiceJs(this.ipfs, this.multihash);

        return this.ipfsService;
    }

    initializeDataAccessService() {
        this.initializeIpfsService();
        this.dataAccessService = new this.DataAccessServiceJs(this.recordService, this.ipfsService, this.utils);

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