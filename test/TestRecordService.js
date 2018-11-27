
var ServiceFactory = require('../test/ServiceFactory.js');
var TestUtils = require('../test/TestUtils.js');

const serviceFactory = new ServiceFactory();
const testUtils = new TestUtils();

contract('RecordService', async (accounts) => {

    before('Setup', async () => {
        serviceFactory.initializeRecordService(await serviceFactory.RecordService.deployed());
    });


    it("Test sendCreate and callRead: Create a record and verify the info is stored by RecordService contract", async () => {

        //Arrange
        let fakeCid = "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT";

        //Act
        let result = await serviceFactory.getRecordService().sendCreate(fakeCid);


        //Assert
        var log = testUtils.getLogByEventName("RecordEvent", result.logs);

        //The event just returns the metadata about our created person.
        const createdId = log.args.id.toNumber();

        assert.equal(createdId, 1, "ID should be 1");
        assert.equal(log.args.eventType, "NEW", "Type should be NEW");
        assert.equal(log.args.index.toNumber(), 0, "Index should be 0");
        assert.equal(log.args.ipfsCid, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT", "Incorrect IPFS CID");
        assert.equal(log.args.owner, accounts[0], "Owner should be this contract");


        //Also verify with a read.
        let record = await serviceFactory.getRecordService().callRead(createdId);


        //Check that the metadata matches.
        assert.equal(record.id, log.args.id.toNumber(), "Ids need to match");
        assert.equal(record.index, log.args.index.toNumber(), "Indexes should match");
        assert.equal(record.ipfsCid, log.args.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

    });
    

});