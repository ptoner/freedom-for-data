const ServiceFactory = require('service-factory.js');


class TestServiceFactory extends ServiceFactory {
    constructor() {
        
        //Initialize IPFS connection. Needs to be running locally.
        var ipfsAPI = require('ipfs-api');
        const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

        super(
            artifacts.require("RecordService"),
            require('multihashes'),
            ipfs
        )

        var Utils = require('../src/utils.js');
        var TestUtils = require('./test-utils.js');

        this.utils = new Utils();
        this.testUtils = new TestUtils();
    }

}



module.exports = function(recordService, ipfsServiceJs, recordServiceJs, dataAccessServiceJs, multihash, utils, testUtils, ipfs) {
    console.log()
    const serviceFactory = new ServiceFactory();

};