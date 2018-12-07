const ServiceFactory = require('./src/service-factory.js');


module.exports = function(recordServiceContract, ipfs) {

    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();
};