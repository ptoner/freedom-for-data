import React from 'react';
import IPFService from '../../../src/js/IPFSService.js';
import RecordService from '../../../src/js/RecordService.js';
import DataAccessService from '../../../src/js/DataAccessService.js';
import Utils from '../../../src/js/Utils.js';

import ServiceFactory from '../../../src/js/ServiceFactory.js';

import multihash from '../../../src/js/multihashes/index.js';



//Initialize IPFS connection. Needs to be running locally.
var ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

const serviceFactory = ServiceFactory(
    artifacts.require("RecordService"),
    IPFService,
    RecordService,
    DataAccessService,
    multihash,
    new Utils(),
    null,
    ipfs
)






class NewRecordForm extends React.Component {
    constructor(props) {
      super(props);

      this.state = {};
  
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
      }
    
  
    handleSubmit(event) {
      alert('A name was submitted: ' + this.state.toString());
      event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            First Name
          </label>
          <input
                value={this.state.firstName}
                onChange={this.handleInputChange}
            />

         
          <input type="submit" value="Submit" />
        </form>
      );
    }
  }

  export default NewRecordForm;