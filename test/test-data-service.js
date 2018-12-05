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
        let resultCreatedRecord1 = await dataService.create({ firstName: "Mark", lastName: "Melancon" });
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
            owner: '0x1E950C631065885d76b21311905acD02c14Aa07E',
            ipfsCid: 'zdpuAy4MmXJTPVReEWNpqnRJ7JTABiQ6zhXvE9kNcqKi4pL81',
            index: 2,
            lastName: 'Polanco',
            firstName: 'Gregory' 
        });

        await assertIndexAndRecordMatch(3, { 
            id: 4,
            owner: '0x1E950C631065885d76b21311905acD02c14Aa07E',
            ipfsCid: 'zdpuApos8UX53uT1Hiwz1ovSB7nUToi2TSz8FQyzMHpQUtWmx',
            index: 3,
            lastName: 'Mercer',
            firstName: 'Jordy' 
        });

        await assertIndexAndRecordMatch(4, { 
            id: 5,
            owner: '0x1E950C631065885d76b21311905acD02c14Aa07E',
            ipfsCid: 'zdpuB3UBv6XoPD8xim1CWuXBNvoXb3heydJfurQ5EQTGHcqAa',
            index: 4,
            lastName: 'Alvarez',
            firstName: 'Pedro' 
        });

        await assertIndexAndRecordMatch(5, { 
            id: 6,
            owner: '0x1E950C631065885d76b21311905acD02c14Aa07E',
            ipfsCid: 'zdpuAynrpuQwgY4DwsDbd4TfPF6pv25f8rcvjnHLCw9j6sp6k',
            index: 5,
            lastName: 'Joyce',
            firstName: 'Matt' 
        });

        await assertIndexAndRecordMatch(6, { 
            id: 7,
            owner: '0x1E950C631065885d76b21311905acD02c14Aa07E',
            ipfsCid: 'zdpuAmRyFGYaKdVmEH3uwqzjv8RdSJmnrABkaSizvAu9JBivG',
            index: 6,
            lastName: 'Morton',
            firstName: 'Charlie' 
        });

        await assertIndexAndRecordMatch(7, { 
            id: 8,
            owner: '0x1E950C631065885d76b21311905acD02c14Aa07E',
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            index: 7,
            lastName: 'Cole',
            firstName: 'Gerrit' 
        });




        

    });


    async function assertIndexAndRecordMatch(index, record) {

        let recordAtIndex = await dataService.readByIndex(index);

        testUtils.assertRecordsMatch(record, recordAtIndex);
    }









});