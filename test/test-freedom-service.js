const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');



contract('FreedomService', async (accounts) => {

    var testUtils = new TestUtils();

    let createdCount = 0;
   
    let freedomService;

    before('Setup', async () => {
        serviceFactory.setRecordServiceContract(await serviceFactory.recordServiceContract.deployed());
        freedomService = serviceFactory.getFreedomService();
    });


    it("Test create/read: Create a 'person' record and verify the info is stored on blockchain and IPFS", async () => {

        //Arrange
        let createdRecord = {
            firstName: "Andrew",
            lastName: "McCutchen"
        }

        //Act
        let resultCreatedRecord = await freedomService.create(createdRecord);

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
        let record = await freedomService.read(resultCreatedRecord.id);

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
        let resultCreatedRecord1 = await freedomService.create({ firstName: "Mark", lastName: "Melancon" });
        let resultCreatedRecord2 = await freedomService.create({ firstName: "Gregory", lastName: "Polanco" });
        let resultCreatedRecord3 = await freedomService.create({ firstName: "Jordy", lastName: "Mercer" });
        let resultCreatedRecord4 = await freedomService.create({ firstName: "Pedro", lastName: "Alvarez" });
        let resultCreatedRecord5 = await freedomService.create({ firstName: "Matt", lastName: "Joyce" });

        createdCount += 5;

        //Act
        let count = await freedomService.count();

        assert.equal(count, createdCount);

    });


    it("Test update: Update a record and make sure the changes are saved.", async () => {
        
        //Arrange
        let resultCreatedRecord = await freedomService.create({ firstName: "Gerrit", lastName: "Cole" });

        
        //Act
        await freedomService.update(
            resultCreatedRecord.id, 
            {
                firstName: "Charlie",
                lastName: "Morton"
            }
        )


        //Assert
        let refetchechRecord = await freedomService.read(resultCreatedRecord.id);

        assert.equal(refetchechRecord.firstName, "Charlie");
        assert.equal(refetchechRecord.lastName, "Morton");
    });



    it("Test update: Update a record this account doesn't own", async () => {
        
        //Arrange
        let resultCreatedRecord = await freedomService.create({ firstName: "Gerrit", lastName: "Cole" });

        
        let error;


        try {
            await freedomService.update(
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
        let refetchechRecord = await freedomService.read(resultCreatedRecord.id);


        assert.equal(refetchechRecord.firstName, "Gerrit");
        assert.equal(refetchechRecord.lastName, "Cole");
    });



    it("Test readByIndex: Read all the records we've written so far", async () => {

        await assertIndexAndRecordMatch(0, {
            id: 1,
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        });

        await assertIndexAndRecordMatch(1, {
            id: 2,
            index: 1,
            ipfsCid: "zdpuAmZw9bUAufGj4rRddtn6Fu1JDkQqt99rJmDerq1z4B1gL",
            owner: accounts[0],
            firstName: "Mark",
            lastName: "Melancon"
        });

        await assertIndexAndRecordMatch(2, { 
            id: 3,
            owner: accounts[0],
            ipfsCid: 'zdpuAy4MmXJTPVReEWNpqnRJ7JTABiQ6zhXvE9kNcqKi4pL81',
            index: 2,
            lastName: 'Polanco',
            firstName: 'Gregory' 
        });

        await assertIndexAndRecordMatch(3, { 
            id: 4,
            owner: accounts[0],
            ipfsCid: 'zdpuApos8UX53uT1Hiwz1ovSB7nUToi2TSz8FQyzMHpQUtWmx',
            index: 3,
            lastName: 'Mercer',
            firstName: 'Jordy' 
        });

        await assertIndexAndRecordMatch(4, { 
            id: 5,
            owner: accounts[0],
            ipfsCid: 'zdpuB3UBv6XoPD8xim1CWuXBNvoXb3heydJfurQ5EQTGHcqAa',
            index: 4,
            lastName: 'Alvarez',
            firstName: 'Pedro' 
        });

        await assertIndexAndRecordMatch(5, { 
            id: 6,
            owner: accounts[0],
            ipfsCid: 'zdpuAynrpuQwgY4DwsDbd4TfPF6pv25f8rcvjnHLCw9j6sp6k',
            index: 5,
            lastName: 'Joyce',
            firstName: 'Matt' 
        });

        await assertIndexAndRecordMatch(6, { 
            id: 7,
            owner: accounts[0],
            ipfsCid: 'zdpuAmRyFGYaKdVmEH3uwqzjv8RdSJmnrABkaSizvAu9JBivG',
            index: 6,
            lastName: 'Morton',
            firstName: 'Charlie' 
        });

        await assertIndexAndRecordMatch(7, { 
            id: 8,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            index: 7,
            lastName: 'Cole',
            firstName: 'Gerrit' 
        });


    });



    it("Test readList: Check for duplicates", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await freedomService.create({ firstName: "Gerrit", lastName: "Cole" });
        }

        assert.equal(await freedomService.count(), 58, "Count is incorrect");


        //Act
        let limit = 10;

        var foundIds = [];
        for (var i=0; i < 5; i++) {
        
            let recordList = await freedomService.readList(limit, i*limit);

            for (record of recordList) {
                if (foundIds.includes(record.id)) {
                    assert.fail("Duplicate ID found in page");
                }

                foundIds.push(record.id);
            }
        }

    });


    it("Test readList: Negative offset", async () => {

        //Arrange
        assert.equal(await freedomService.count(), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readList(10, -1);
        } catch(ex) {
           error = ex;
          }


        //Assert
        assert.equal("Invalid offset provided", error, "Error message does not match");


    });

    it("Test readList: Negative limit", async () => {

        //Arrange
        assert.equal(await freedomService.count(), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readList(-1, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Invalid limit provided", error, "Error message does not match");


    });



    it("Test readList: Zero limit", async () => {

        //Arrange
        assert.equal(await freedomService.count(), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readList(0, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Invalid limit provided", error, "Error message does not match");


    });







    async function assertIndexAndRecordMatch(index, record) {

        let recordAtIndex = await freedomService.readByIndex(index);

        testUtils.assertRecordsMatch(record, recordAtIndex);
    }









});