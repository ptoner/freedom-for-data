
var ServiceFactory = require('../test/ServiceFactory.js');


const serviceFactory = new ServiceFactory();

contract('DataAccessService', async (accounts) => {

    let createdCount = 0;

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

        createdCount++;

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


    it("Test count: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        let resultCreatedRecord1 = await serviceFactory.getDataAccessService().create({ firstName: "Andrew", lastName: "McCutchen" });
        let resultCreatedRecord2 = await serviceFactory.getDataAccessService().create({ firstName: "Gregory", lastName: "Polanco" });
        let resultCreatedRecord3 = await serviceFactory.getDataAccessService().create({ firstName: "Jordy", lastName: "Mercer" });
        let resultCreatedRecord4 = await serviceFactory.getDataAccessService().create({ firstName: "Pedro", lastName: "Alvarez" });
        let resultCreatedRecord5 = await serviceFactory.getDataAccessService().create({ firstName: "Matt", lastName: "Joyce" });

        createdCount += 5;

        //Act
        let count = await serviceFactory.getDataAccessService().count();

        assert.equal(count, createdCount);

    });


    it("Test update: Update a record and make sure the changes are saved.", async () => {
        
        //Arrange
        let resultCreatedRecord = await serviceFactory.getDataAccessService().create({ firstName: "Gerrit", lastName: "Cole" });

        
        //Act
        await serviceFactory.getDataAccessService().update(
            resultCreatedRecord.id, 
            {
                firstName: "Charlie",
                lastName: "Morton"
            }
        )


        //Assert
        let refetchechRecord = await serviceFactory.getDataAccessService().read(resultCreatedRecord.id);


        assert.equal(refetchechRecord.firstName, "Charlie");
        assert.equal(refetchechRecord.lastName, "Morton");
    });



    it("Test update: Update a record this account doesn't own", async () => {
        
        //Arrange
        let resultCreatedRecord = await serviceFactory.getDataAccessService().create({ firstName: "Gerrit", lastName: "Cole" });

        
        let error;


        try {
            await serviceFactory.getDataAccessService().update(
                resultCreatedRecord.id, 
                {
                    firstName: "Charlie",
                    lastName: "Morton"
                },
                {
                    from: accounts[1]
                }
            )
        } catch(ex) {
            error = ex;
        }

        
        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You don't own this record -- Reason given: You don't own this record.", 
            serviceFactory.getDataAccessService().utils.getRequireMessage(error), 
            
            "Should fail to update record user doesn't own."
        );

        //Do a read and make sure it shows the original value
        let refetchechRecord = await serviceFactory.getDataAccessService().read(resultCreatedRecord.id);


        assert.equal(refetchechRecord.firstName, "Gerrit");
        assert.equal(refetchechRecord.lastName, "Cole");
    });

});