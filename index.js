require("@babel/polyfill");

const ServiceFactory = require('./src/service-factory.js');
const ipfsClient = require('ipfs-http-client');
const TruffleContract = require('truffle-contract');

const RecordServiceJson = require('./build/contracts/RecordService.json');
const Web3Exception = require('./src/exceptions/web3-exception.js');


const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );


const Freedom = async function(config) {

    console.log(config);

    //Replace contract info
    RecordServiceJson.networks["5777"].address = config.recordContractAddress;
    RecordServiceJson.networks["5777"].transactionHash = config.recordContractTransactionHash;


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

    try {

        recordService.setProvider(web3Provider);
        recordService.defaults({from: account});

        var recordServiceContract = await recordService.deployed();
    } catch (ex) {
        throw new Web3Exception(ex.message)
    }




    /**
    * IPFS configuration for tests
    */
    var ipfs = ipfsClient({ 
        host: config.ipfsHost, 
        port: config.ipfsPort 
    });

    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();

};


exports = module.exports = Freedom;
