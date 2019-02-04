// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // to customize your Truffle configuration!
// };
require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider')


module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6109322
    },
    ropsten: {
      provider: () => new HDWalletProvider(
          process.env.MNEMONIC,
          process.env.ROPSTEN_URL),
      network_id: 3
    }
  }
}