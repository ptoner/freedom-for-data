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


const Freedom = async function(config, web3Provider, contract) {


    // Request account access
    await window.ethereum.enable();
    console.log("Account access enabled");

    //Set provider 
    if (web3Provider) {
      window.web3Provider = web3Provider
      console.log("Provider set to: ")
      console.log(web3Provider)
    } else {
      window.web3Provider = window.ethereum;
      console.log("Provider set to ethereum");
    }

    
    window.web3.setProvider(window.web3Provider);
    


    const accounts = await promisify(cb => window.web3.eth.getAccounts(cb));

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
