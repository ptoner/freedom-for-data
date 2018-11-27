class ServiceFactory {
    constructor() {

        //Contract dependencies
        this.RecordService = artifacts.require("RecordService");

        //Javascript dependencies
        this.IPFSServiceJs = require('../src/js/IPFSService.js')
        this.RecordServiceJs = require('../src/js/RecordService.js');
        this.DataAccessServiceJs = require('../src/js/DataAccessService.js');
        this.multihash = require('multihashes');

        //Initialize IPFS connection. Needs to be running locally.
        this.ipfsAPI = require('ipfs-api');
        this.ipfs = this.ipfsAPI('localhost', '5001', {protocol: 'http'});

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
        this.dataAccessService = new this.DataAccessServiceJs(this.recordService, this.ipfsService);

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