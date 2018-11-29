const ServiceFactory = require('../src/service-factory.js');


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

    }

}


module.exports = TestServiceFactory;