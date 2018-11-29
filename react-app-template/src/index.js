// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';

// Import Framework7
import Framework7 from 'framework7/framework7.esm.bundle';

// Import Framework7-React plugin
import Framework7React from 'framework7-react';

// Import main App component
import App from './components/App.jsx';

// Framework7 styles
import 'framework7/css/framework7.min.css';

// Icons
import './css/icons.css';

// Custom app styles
import './css/app.css';

// Init Framework7-React plugin
Framework7.use(Framework7React);



import ipfsAPI from './ipfs/ipfs.js';


/**
 * IPFS configuration for tests
 */
const IPFS_HOST = "localhost";
const IPFS_PORT = 5001;
const IPFS_OPTIONS = {
    protocol: 'http'
}


// Is there is an injected web3 instance?
if (typeof web3 !== 'undefined') {
  App.web3Provider = web3.currentProvider;
  web3 = new Web3(web3.currentProvider);
} else {
  // If no injected web3 instance is detected, fallback to Ganache.
  App.web3Provider = new web3.providers.HttpProvider('http://127.0.0.1:7545');
  web3 = new Web3(App.web3Provider);
}

let accounts = await web3.eth.getAccounts();

import RecordServiceJson from ''

const RecordService = TruffleContract(RecordServiceJson);

console.log(RecordService);



var serviceFactory = ServiceFactory(
  artifacts.require("RecordService"),
  multihash,
  ipfsAPI(IPFS_HOST, IPFS_PORT, IPFS_OPTIONS)
)






// Mount React App
ReactDOM.render(
  React.createElement(App),
  document.getElementById('app'),
);
