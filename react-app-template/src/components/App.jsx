import React from 'react';
import {
  App,
  Panel,
  View,
  Statusbar
} from 'framework7-react';

import routes from '../routes';


// import IPFServiceJS from '../../../src/IPFSService.js';
// import RecordServiceJS from '../../../src/RecordService.js';
// import DataAccessServiceJS from '../../../src/DataAccessService.js';
// import Utils from '../../../src/Utils.js';

// import ServiceFactory from '../../../src/ServiceFactory.js';

// import multihash from '../../../src/js/multihashes/index.js';

// import TruffleContract from "../../../src/js/truffle/truffle-contract.js"

// import RecordServiceJson from "../../../build/contracts/RecordService.json";


// //Initialize IPFS connection. Needs to be running locally.
// var ipfsAPI = require('ipfs-api');
// const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});


// // Is there is an injected web3 instance?
// if (typeof web3 !== 'undefined') {
//   App.web3Provider = web3.currentProvider;
//   web3 = new Web3(web3.currentProvider);
// } else {
//   // If no injected web3 instance is detected, fallback to Ganache.
//   App.web3Provider = new web3.providers.HttpProvider('http://127.0.0.1:7545');
//   web3 = new Web3(App.web3Provider);
// }

// let accounts = await web3.eth.getAccounts();

// const RecordService = TruffleContract(RecordServiceJson);

// console.log(RecordService);



// const serviceFactory = ServiceFactory(
//     RecordServiceJson,
//     IPFServiceJS,
//     RecordServiceJS,
//     DataAccessServiceJS,
//     multihash,
//     new Utils(),
//     null,
//     ipfs
// )






export default function (props) {

  // Framework7 parameters here
  const f7params = {
    id: 'io.framework7.testapp', // App bundle ID
    name: 'Ethereum/IPFS Javascript Storage Service Demo', // App name
    theme: 'auto', // Automatic theme detection
    // App routes
    routes,

    on: {
      init: function() {
        console.log("App init");










      }
    }
  };

  return (
    <App params={f7params}>
      {/* Statusbar */}
      <Statusbar />

      {/* Left Panel */}
      <Panel left cover themeDark>
        <View url="/panel-left/" />
      </Panel>

      {/* Right Panel */}
      <Panel right reveal themeDark>
        <View url="/panel-right/"/>
      </Panel>

      {/* Main View */}
      <View id="main-view" url="/" main className="ios-edges"/>

      {/* Popup */}
      {/* <Popup id="popup">
        <View>
          <Page>
            <Navbar title="Popup">
              <NavRight>
                <Link popupClose>Close</Link>
              </NavRight>
            </Navbar>
            <Block>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Neque, architecto. Cupiditate laudantium rem nesciunt numquam, ipsam. Voluptates omnis, a inventore atque ratione aliquam. Omnis iusto nemo quos ullam obcaecati, quod.</Block>
          </Page>
        </View>
      </Popup> */}

      {/* Login Screen */}
      {/* <LoginScreen id="login-screen">
        <View>
          <Page loginScreen>
            <LoginScreenTitle>Login</LoginScreenTitle>
            <List form>
              <ListItem>
                <Label>Username</Label>
                <Input name="username" placeholder="Username" type="text"></Input>
              </ListItem>
              <ListItem>
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="Password"></Input>
              </ListItem>
            </List>
            <List>
              <ListButton title="Sign In" loginScreenClose></ListButton>
              <BlockFooter>
                <p>Click Sign In to close Login Screen</p>
              </BlockFooter>
            </List>
          </Page>
        </View>
      </LoginScreen> */}
    </App>
  );
};
