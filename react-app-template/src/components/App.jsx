import React from 'react';
import {
  App,
  Panel,
  View,
  Statusbar
} from 'framework7-react';

import routes from '../routes';


/**
 * Imports for solidity-storage-service
 */
import ipfsClient from '../../node_modules/ipfs-http-client/src/index.js';
import RecordServiceJson from '../truffle/RecordService.json';
import TruffleContract from '../../node_modules/truffle-contract';
import Freedom from '../../node_modules/freedom-for-data';




export default function (props) {

  // Framework7 parameters here
  const f7params = {
    id: 'io.framework7.testapp', // App bundle ID
    name: 'Ethereum/IPFS Javascript Storage Service Demo', // App name
    theme: 'auto', // Automatic theme detection
    // App routes
    routes,

    on: {
      init: async function() {

        console.log("App init");
        

        // Modern dapp browsers...
        if (window.ethereum) {

          try {

            // Request account access
            await window.ethereum.enable();
            console.log("Account access enabled");

            //Set provider 
            window.web3Provider = window.ethereum;
            window.web3.setProvider(window.web3Provider);
            console.log("Provider set to ethereum");

            /**
             * Load first account. Now we can initialize all our stuff.
             */
            window.web3.eth.getAccounts(async function(error, accounts) {

              if (error) {
                console.log(error);
              }
            
              var account = accounts[0];


              /** 
               * Get record contract service
               */
              const recordService = TruffleContract(RecordServiceJson);
              recordService.setProvider(window.web3Provider);
              recordService.defaults({from: account});  

              var recordServiceContract = await recordService.deployed();

  
              /**
               * IPFS configuration for tests
               */
              var ipfs = ipfsClient({ 
                host: 'localhost', 
                port: '5001', 
                protocol: 'http' 
              })
              
              var freedom = Freedom(recordServiceContract, ipfs);
              

              
              /**
               * Call the create method
               */
              var result = await freedom.create({
                firstName: 'Andrew',
                lastName: 'McCutchen'
              });

              console.log(result);

              /**
               * Read the result
               */
              var readResult = await freedom.read(result.id);

              console.log(readResult);
            });


          } catch (error) {
            // User denied account access...
            console.error("User denied account access")
          }
          
        }







       


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
