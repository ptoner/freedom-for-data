require("@babel/polyfill");

const ServiceFactory = require('./src/service-factory.js');
const ipfsClient = require('ipfs-http-client');
const TruffleContract = require('truffle-contract');

const RecordServiceJson = require('./build/contracts/RecordService.json');


const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }

      resolve(res);
    })
  );


const Freedom = async function(config) {

    // Request account access
    await window.ethereum.enable();
    console.log("Account access enabled");

    //Set provider 
    window.web3Provider = window.ethereum;
    window.web3.setProvider(window.web3Provider);
    console.log("Provider set to ethereum");


    const accounts = await promisify(cb => window.web3.eth.getAccounts(cb));

    let account = accounts[0];

    
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
    var ipfs = ipfsClient({ 
        host: config.ipfsHost, 
        port: config.ipfsPort 
    });



    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    window.Freedom = this;

    return serviceFactory.getFreedomService();

};


exports = module.exports = Freedom;
