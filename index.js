import ServiceFactory from './service-factory.js';


export default function(recordServiceContract, ipfs) {

    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();
};