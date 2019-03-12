require("@babel/polyfill");

const ServiceFactory = require('./src/service-factory.js')



const Web3Exception = require('./src/exceptions/web3-exception.js')
const IpfsException = require('./src/exceptions/ipfs-exception.js')
const ValidationException = require('./src/exceptions/validation-exception')


const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );


const Freedom = async function(ipfs, contract) {

    const serviceFactory = new ServiceFactory(contract, ipfs);

    return serviceFactory.getFreedomService();

};


exports = module.exports = Freedom;
