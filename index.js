const ServiceFactory = require('./src/service-factory.js');
const ipfsClient = require('ipfs-http-client');
const TruffleContract = require('truffle-contract')


export default function(recordServiceContract, ipfs) {

    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();
};