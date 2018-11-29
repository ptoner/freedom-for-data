const ServiceFactory = require('../src/service-factory.js');
var ipfsAPI = require('ipfs-api');

/**
 * IPFS configuration for tests
 */
const IPFS_HOST = "localhost";
const IPFS_PORT = 5001;
const IPFS_OPTIONS = {
    protocol: 'http'
}

class TestServiceFactory extends ServiceFactory {
    constructor() {
        super(
            artifacts.require("RecordService"),
            ipfsAPI(IPFS_HOST, IPFS_PORT, IPFS_OPTIONS)
        )
    }

}


module.exports = TestServiceFactory;