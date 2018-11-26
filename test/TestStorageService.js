
//Contract dependencies
var StorageService = artifacts.require("StorageService");

//Javascript dependencies
var StorageServiceJs = require('../src/js/StorageService.js');


const ipfsAPI = require('ipfs-api');

var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})


contract('StorageService', async (accounts) => {


    //Keep track of how many items we inserted so that we can run counts.
    let createdCount = 0;


    var storageService = new StorageServiceJs();


    beforeEach('Setup each test', async () => {
        storageService.storageServiceContract = await StorageService.deployed();
        storageService.ipfs = ipfs;
    });


    it("Test sendCreate", async () => {

        //Arrange and act
        let result = await storageService.create({
            title: "blah",
            otherThing: "blah2"
        });


        //Assert
        var log = getLogByEventName("ItemEvent", result.logs);

        assert.equal(log.args.id.toNumber(), 1, "ID should be 1");
        assert.equal(log.args.eventType, "NEW", "Type should be NEW");
        assert.equal(log.args.index, 0, "Index should be 0");
        assert.equal(log.args.ipfsHash, "QmSAyAcLaW6hvCSmd9VRTSX6Bcenr6iL825bDTmnqKY19D", "Incorrect IPFS hash");
        assert.equal(log.args.owner, accounts[0], "Owner should be this contract");


        //Also verify with a read.
        let item = await storageService.read(log.args.id.toNumber());

        assert.equal(item.id.toNumber(), log.args.id.toNumber(), "Ids need to match");
        assert.equal(item.index, log.args.index, "Indexes should match");
        assert.equal(item.ipfsHash, log.args.ipfsHash, "ipfsHash should match");
        assert.equal(item.owner,accounts[0], "Owner should be this contract");


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


});



