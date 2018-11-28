
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

        //Compare what we just created with what we expect the result to look like. 
        assertRecordsMatch( resultCreatedRecord, {
            id: 1,
            eventType: "NEW",
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        })

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
                firstName: 'Andrew'
                lastName: 'McCutchen'
            }
         */

        assertRecordsMatch( record, {
            id: 1,
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        })



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






    function assertRecordsMatch(record1, record2) {
        //Assert
        assert.equal(record1.id, record2.id, "IDs should match");
        assert.equal(record1.eventType, record2.eventType, "Type should match");
        assert.equal(record1.index, record2.index, "Index should match");
        assert.equal(record1.ipfsCid, record2.ipfsCid, "IPFS cid should match");
        assert.equal(record1.owner, record2.owner, "Owner should match");

        //Check saved fields
        assert.equal(record1.firstName, record2.firstName, "Incorrect firstName value");
        assert.equal(record1.lastName, record2.lastName, "Incorrect lastName value");
    }



});