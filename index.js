require("@babel/polyfill");

const ServiceFactory = require('./src/service-factory.js')
const ipfsClient = require('ipfs-http-client')


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


const Freedom = async function(config, web3, contract) {


    const accounts = await promisify(cb => web3.eth.getAccounts(cb));

    let account = accounts[0]
    window.currentAccount = account

    console.log(`Current Account: ${window.currentAccount}`)

 

    /**
    * IPFS configuration for tests
    */
    const ipfs = ipfsClient(config.ipfsConfig)


    const serviceFactory = new ServiceFactory(contract, ipfs);

    return serviceFactory.getFreedomService();

};


exports = module.exports = Freedom;
