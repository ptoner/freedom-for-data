const ServiceFactory = require('../src/service-factory.js');


class TestServiceFactory extends ServiceFactory {
    constructor() {

        var Utils = require('../src/utils.js');
        var TestUtils = require('./test-utils.js');

        //Initialize IPFS connection. Needs to be running locally.
        var ipfsAPI = require('ipfs-api');
        const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

        super(
            artifacts.require("RecordService"),
            require('../src/ipfs-service.js'),
            require('../src/record-service.js'),
            require('../src/data-access-service.js'),
            require('multihashes'),
            new Utils(),
            new TestUtils(),
            ipfs
        )
    }

}


module.exports = TestServiceFactory;