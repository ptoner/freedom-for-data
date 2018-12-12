const ServiceFactory = require('./src/service-factory.js');
const ipfsClient = require('ipfs-http-client');
const TruffleContract = require('truffle-contract');

const RecordServiceJson = require('./build/contracts/RecordService.json');

exports = module.exports = async function(account, web3Provider, ipfsConfig) {

    /** 
     * Get record contract service
     */
    const recordService = TruffleContract(RecordServiceJson);
    recordService.setProvider(web3Provider);
    recordService.defaults({from: account});  

    var recordServiceContract = await recordService.deployed();


    /**
    * IPFS configuration for tests
    */
    var ipfs = ipfsClient(ipfsConfig);



    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();
};