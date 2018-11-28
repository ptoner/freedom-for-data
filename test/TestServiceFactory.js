const ServiceFactory = require('../src/js/ServiceFactory.js');


class TestServiceFactory extends ServiceFactory {
    constructor() {

        var Utils = require('../src/js/Utils.js');
        var TestUtils = require('./TestUtils.js');

        //Initialize IPFS connection. Needs to be running locally.
        var ipfsAPI = require('ipfs-api');
        const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

        super(
            artifacts.require("RecordService"),
            require('../src/js/IPFSService.js'),
            require('../src/js/RecordService.js'),
            require('../src/js/DataAccessService.js'),
            require('multihashes'),
            new Utils(),
            new TestUtils(),
            ipfs
        )
    }

}


module.exports = TestServiceFactory;