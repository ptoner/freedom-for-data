
var ServiceFactory = require('../test/ServiceFactory.js');
var TestUtils = require('../test/TestUtils.js');

const serviceFactory = new ServiceFactory();
const testUtils = new TestUtils();

contract('DataAccessService', async (accounts) => {

    before('Setup', async () => {
        serviceFactory.initializeRecordService(await serviceFactory.RecordService.deployed());
        serviceFactory.initializeDataAccessService();
    });


    it("Test create/read: Create a 'person' record and verify the info is stored on blockchain and IPFS", async () => {

        //Arrange
        let createdRecord = {
            firstName: "Andrew",
            lastName: "McCutchen"
        }

        //Act
        let result = await serviceFactory.getDataAccessService().create(createdRecord);


        //Assert
        var log = testUtils.getLogByEventName("RecordEvent", result.logs);

        //The event just returns the metadata about our created person.
        const createdId = log.args.id.toNumber();

        assert.equal(createdId, 1, "ID should be 1");
        assert.equal(log.args.eventType, "NEW", "Type should be NEW");
        assert.equal(log.args.index.toNumber(), 0, "Index should be 0");
        assert.equal(log.args.ipfsCid, "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT", "Incorrect IPFS CID");
        assert.equal(log.args.owner, accounts[0], "Owner should be this contract");


        //Also verify with a read.
        let record = await serviceFactory.getDataAccessService().read(createdId);

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


    });


});