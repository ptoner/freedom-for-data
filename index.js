require("@babel/polyfill");

const ServiceFactory = require('./src/service-factory.js')
const ipfsClient = require('ipfs-http-client')
const TruffleContract = require('truffle-contract')

const RecordServiceJson = require('./build/contracts/RecordService.json')



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


const Freedom = async function(config) {

    //Replace contract info
    RecordServiceJson.networks["5777"].address = config.recordContractAddress;
    RecordServiceJson.networks["5777"].transactionHash = config.recordContractTransactionHash;

    RecordServiceJson.networks["3"].address = config.recordContractAddress;
    RecordServiceJson.networks["3"].transactionHash = config.recordContractTransactionHash;


    // Request account access
    await window.ethereum.enable();
    console.log("Account access enabled");

    //Set provider 
    window.web3Provider = window.ethereum;
    window.web3.setProvider(window.web3Provider);
    console.log("Provider set to ethereum");


    const accounts = await promisify(cb => window.web3.eth.getAccounts(cb));

    let account = accounts[0]
    window.currentAccount = account

    console.log(`Current Account: ${window.currentAccount}`)

    /**
     * Get record contract service
     */
    const truffleContract = TruffleContract(RecordServiceJson);


    let recordServiceContract

    try {

        truffleContract.setProvider(web3Provider);
        truffleContract.defaults({from: account});

        recordServiceContract = await truffleContract.deployed();
    } catch (ex) {
        throw new Web3Exception(ex)
    }




    /**
    * IPFS configuration for tests
    */
    const ipfs = ipfsClient(config.ipfsConfig)


    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();

};


exports = module.exports = Freedom;
