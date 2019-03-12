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

let contract = artifacts.require("RecordService")


class TestServiceFactory extends ServiceFactory {
    constructor() {
        super(contract,ipfs)
    }

    setContract(contract) {
        super.initialize(contract, this.ipfs)
    }

}


module.exports = TestServiceFactory;