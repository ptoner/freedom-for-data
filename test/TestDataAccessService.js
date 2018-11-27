
var ServiceFactory = require('../test/ServiceFactory.js');


const serviceFactory = new ServiceFactory();

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
        let resultCreatedRecord = await serviceFactory.getDataAccessService().create(createdRecord);

        

        //Assert
        assert.equal(resultCreatedRecord.id, 1, "ID should be 1");
        assert.equal(resultCreatedRecord.eventType, "NEW", "Type should be NEW");
        assert.equal(resultCreatedRecord.index, 0, "Index should be 0");
        assert.equal(resultCreatedRecord.ipfsCid, "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT", "Incorrect IPFS CID");
        assert.equal(resultCreatedRecord.owner, accounts[0], "Owner should be this contract");

        //Check saved fields
        assert.equal(resultCreatedRecord.firstName, "Andrew", "Incorrect firstName value");
        assert.equal(resultCreatedRecord.lastName, "McCutchen", "Incorrect lastName value");

        //Also verify with a read.
        let record = await serviceFactory.getDataAccessService().read(resultCreatedRecord.id);

        console.log(record);

        /**
         * Expected record
         * 
         * { 
         *      id: 1,
                owner: '...will match first address...',
                ipfsCid: 'zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT',
                index: 0,
                lastName: 'McCutchen',
                firstName: 'Andrew' 
            }
         */


        //Check that the metadata matches.
        assert.equal(record.id, resultCreatedRecord.id, "Ids need to match");
        assert.equal(record.index, resultCreatedRecord.index, "Indexes should match");
        assert.equal(record.ipfsCid, resultCreatedRecord.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

        //Check the fields that we originally set.
        assert.equal(record.firstName, "Andrew", "Incorrect firstName value");
        assert.equal(record.lastName, "McCutchen", "Incorrect lastName value");


    });


});