const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');



contract('DataService', async (accounts) => {

    var testUtils = new TestUtils();

    let createdCount = 0;
   
    let dataService;

    before('Setup', async () => {
        serviceFactory.setRecordServiceContract(await serviceFactory.recordServiceContract.deployed());
        dataService = serviceFactory.getDataService();
    });


    it("Test create/read: Create a 'person' record and verify the info is stored on blockchain and IPFS", async () => {

        //Arrange
        let createdRecord = {
            firstName: "Andrew",
            lastName: "McCutchen"
        }

        //Act
        let resultCreatedRecord = await dataService.create(createdRecord);

        createdCount++;

        //Compare what we just created with what we expect the result to look like. 
        testUtils.assertRecordsMatch( resultCreatedRecord, {
            id: 1,
            eventType: "NEW",
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        })

        //Also verify with a read.
        let record = await dataService.read(resultCreatedRecord.id);

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

        testUtils.assertRecordsMatch( record, {
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
        let resultCreatedRecord1 = await dataService.create({ firstName: "Andrew", lastName: "McCutchen" });
        let resultCreatedRecord2 = await dataService.create({ firstName: "Gregory", lastName: "Polanco" });
        let resultCreatedRecord3 = await dataService.create({ firstName: "Jordy", lastName: "Mercer" });
        let resultCreatedRecord4 = await dataService.create({ firstName: "Pedro", lastName: "Alvarez" });
        let resultCreatedRecord5 = await dataService.create({ firstName: "Matt", lastName: "Joyce" });

        createdCount += 5;

        //Act
        let count = await dataService.count();

        assert.equal(count, createdCount);

    });


    it("Test update: Update a record and make sure the changes are saved.", async () => {
        
        //Arrange
        let resultCreatedRecord = await dataService.create({ firstName: "Gerrit", lastName: "Cole" });

        
        //Act
        await dataService.update(
            resultCreatedRecord.id, 
            {
                firstName: "Charlie",
                lastName: "Morton"
            }
        )


        //Assert
        let refetchechRecord = await dataService.read(resultCreatedRecord.id);

        assert.equal(refetchechRecord.firstName, "Charlie");
        assert.equal(refetchechRecord.lastName, "Morton");
    });



    it("Test update: Update a record this account doesn't own", async () => {
        
        //Arrange
        let resultCreatedRecord = await dataService.create({ firstName: "Gerrit", lastName: "Cole" });

        
        let error;


        try {
            await dataService.update(
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
            testUtils.getRequireMessage(error), 
            
            "Should fail to update record user doesn't own."
        );

        //Do a read and make sure it shows the original value
        let refetchechRecord = await dataService.read(resultCreatedRecord.id);


        assert.equal(refetchechRecord.firstName, "Gerrit");
        assert.equal(refetchechRecord.lastName, "Cole");
    });








});