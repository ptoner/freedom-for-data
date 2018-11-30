const ServiceFactory = require('../src/service-factory.js');
var ipfsClient = require('ipfs-http-client');

/**
 * IPFS configuration for tests
 */
const ipfs = ipfsClient({ 
    host: 'localhost', 
    port: '5001', 
    protocol: 'http' 
  })

/**
 * Get the contract
 */
const recordServiceContract = artifacts.require("RecordService");


class TestServiceFactory extends ServiceFactory {
    constructor() {
        super(
            recordServiceContract,
            ipfs
        )
    }

    setRecordServiceContract(recordServiceContract) {
        super.initialize(recordServiceContract, this.ipfs);
    }

}


module.exports = TestServiceFactory;