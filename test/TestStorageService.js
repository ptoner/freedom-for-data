
//Contract dependencies
var StorageService = artifacts.require("StorageService");

//Javascript dependencies
var StorageServiceJs = require('../src/js/StorageService.js');
var multihash = require('multihashes');

//Initialize IPFS connection. Needs to be running locally.
const ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})



contract('StorageService', async (accounts) => {


    //Keep track of how many recordds we inserted so that we can run counts.
    let createdCount = 0;


    var storageService = new StorageServiceJs();


    beforeEach('Setup each test', async () => {
        storageService.storageServiceContract = await StorageService.deployed();
        storageService.ipfs = ipfs;
        storageService.multihash = multihash;
    });


    it("Test create: Create a 'person' record and verify the info is stored on blockchain and IPFS", async () => {

        //Arrange
        let createdRecord = {
            firstName: "Andrew",
            lastName: "McCutchen"
        }

        //Act
        let result = await storageService.create(createdRecord);


        //Assert
        var log = getLogByEventName("RecordEvent", result.logs);

        //The event just returns the metadata about our created person.
        assert.equal(log.args.id.toNumber(), 1, "ID should be 1");
        assert.equal(log.args.eventType, "NEW", "Type should be NEW");
        assert.equal(log.args.index.toNumber(), 0, "Index should be 0");
        assert.equal(log.args.ipfsCid, "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT", "Incorrect IPFS CID");
        assert.equal(log.args.owner, accounts[0], "Owner should be this contract");


        //Also verify with a read.
        
        let record = await storageService.read(log.args.id.toNumber());

        /**
         * Expected record
         * 
         * { 
         *      id: 1,
                owner: '...will match first address...',
                ipfsCid: 'zdpuAurbVPh4jNeQSf46osJSuLDDDXSSbtE1ZWaZEZTgGK1Qa',
                index: 0,
                lastName: 'Toner',
                firstName: 'Pat' 
            }
         */


        //Check that the metadata matches.
        assert.equal(record.id, log.args.id.toNumber(), "Ids need to match");
        assert.equal(record.index, log.args.index.toNumber(), "Indexes should match");
        assert.equal(record.ipfsCid, log.args.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

        //Check the fields that we originally set.
        assert.equal(record.firstName, "Andrew", "Incorrect firstName value");
        assert.equal(record.lastName, "McCutchen", "Incorrect lastName value");

        createdCount++;


    });


    it("Test sendCreate: Create a record with no IPFS cid.", async () => {

        //Arrange

        let error;

        //Act
        try {
            let result = await storageService.sendCreate();
        } catch(ex) {
            error = ex;
        }

        assert.isTrue(error instanceof Error, "No exception was thrown when creating record without an IPFS cid" );

    });

    
    it("Test callRead: Create a record and then try to read it by ID", async () => {

        //Arrange
        let createdRecord = {
            firstName: "Jordy",
            lastName: "Mercer"
        }


        let result = await storageService.create(createdRecord);
        var log = getLogByEventName("RecordEvent", result.logs);
        createdId = log.args.id;


        //Act
        let record = await storageService.callRead(createdId);

        // console.log(record);

        assert.equal(record.id, createdId.toNumber(), "Ids need to match");
        assert.equal(record.index, 1, "Index should be 1");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

        //Cleanup
        createdCount++;

    });


    function getLogByEventName(eventName, logs) {

        if (!logs) return;

        var found;

        logs.forEach(function(log){

            if (log.event == eventName) {
                found = log;
            }
        });

        return found;


    }


    function getRequireMessage(ex) {
        // return ex.message.substr(43);
        // return ex.message;
        return ex.message.substr(ex.message.lastIndexOf(": revert")+8).trim();
    }


});



