const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');

const fs = require('fs');



contract('FreedomService', async (accounts) => {

    var testUtils = new TestUtils();

    let createdCount = 0;

    let TEST_REPO1 = 1;
   
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
        let resultCreatedRecord = await freedomService.create(TEST_REPO1, createdRecord);
        

        createdCount++;

        //Compare what we just created with what we expect the result to look like. 
        testUtils.assertRecordsMatch( resultCreatedRecord, {
            id: 1,
            eventType: "NEW",
            repoId: TEST_REPO1,
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        })

        //Also verify with a read.
        let record = await freedomService.read(TEST_REPO1, resultCreatedRecord.id);
        

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
            repoId: TEST_REPO1,
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        })


    });


    it("Test read: Zero repoId", async () => {
        
        //Arrange
        let error;

        try {
            let result = await freedomService.read(0, 1);
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply a repo", 
            testUtils.getRequireMessage(error), 
            
            "Supply a non-empty repo"
        );

    });

    it("Test read: Zero id", async () => {
        
        //Arrange
        let error;

        try {
            let result = await freedomService.read(1, 0);
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply an id", 
            testUtils.getRequireMessage(error), 
            
            "Supply an id"
        );

    });


    it("Test read: Invalid positive id", async () => {
        
        //Arrange
        let error;

        try {
            let result = await freedomService.read(1, 5000);
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "No record found", 
            testUtils.getRequireMessage(error), 
            
            "No record found"
        );

    });


    it("Test create: Try with an account that's not the owner. Should throw an exception.", async () => {
        
        //Arrange
        let createdRecord = {
            firstName: "Andrew",
            lastName: "McCutchen"
        }


        let error;
    

        try {
            await freedomService.create(
                TEST_REPO1, 
                createdRecord, 
                {
                    from: accounts[1]
                } 
            );
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "Permission denied -- Reason given: Permission denied.", 
            testUtils.getRequireMessage(error), 
            
            "Should fail to let non-owner call create"
        );

    });



    it("Test sendCreate: Zero repoId", async () => {
        
        //Arrange
        let createdRecord = {
            firstName: "Andrew",
            lastName: "McCutchen"
        }

        let error;


        try {
            await freedomService.create(0, createdRecord);
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply a repo -- Reason given: You must supply a repo.", 
            testUtils.getRequireMessage(error), 
            
            "Should fail to let non-owner call create"
        );

    });


    it("Test count: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        await freedomService.create(TEST_REPO1, { firstName: "Mark", lastName: "Melancon" });
        await freedomService.create(TEST_REPO1, { firstName: "Gregory", lastName: "Polanco" });
        await freedomService.create(TEST_REPO1, { firstName: "Jordy", lastName: "Mercer" });
        await freedomService.create(TEST_REPO1, { firstName: "Pedro", lastName: "Alvarez" });
        await freedomService.create(TEST_REPO1, { firstName: "Matt", lastName: "Joyce" });

        createdCount += 5;

        //Act
        let count = await freedomService.count(TEST_REPO1);

        assert.equal(count, createdCount);

    });

    it("Test countOwner: Make sure it matches", async () => {

        //Act
        let count = await freedomService.countOwner(TEST_REPO1);

        assert.equal(count, createdCount);

    });



    it("Test count: Pass zero repoId", async () => {
        //Act

        let error;
        try {
            await freedomService.count(0)
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply a repo", 
            testUtils.getRequireMessage(error), 
            
            "You must supply a repo"
        );
        
    });


    it("Test countOwner: Pass zero repoId", async () => {
        //Act

        let error;
        try {
            await freedomService.countOwner(0)
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply a repo", 
            testUtils.getRequireMessage(error), 
            
            "You must supply a repo"
        );
        
    });

    it("Test count: Pass positive invalid repoId. Get zero count.", async () => {
        
        //Act
        let count = await freedomService.count(200);
        
        //Assert
        assert.equal(count, 0);
        
    });

    it("Test countOwner: Pass positive invalid repoId. Get zero count.", async () => {
        
        //Act
        let count = await freedomService.countOwner(200);
        
        //Assert
        assert.equal(count, 0);
        
    });



    it("Test update: Update a record and make sure the changes are saved.", async () => {
        
        //Arrange
        let resultCreatedRecord = await freedomService.create(TEST_REPO1, { firstName: "Gerrit", lastName: "Cole" });

        
        //Act
        await freedomService.update(
            TEST_REPO1, 
            resultCreatedRecord.id, 
            {
                firstName: "Charlie",
                lastName: "Morton"
            }
        )


        //Assert
        let refetchechRecord = await freedomService.read(TEST_REPO1, resultCreatedRecord.id);

        assert.equal(refetchechRecord.firstName, "Charlie");
        assert.equal(refetchechRecord.lastName, "Morton");
    });



    it("Test update: Update a record this account doesn't own", async () => {
        
        //Arrange
        let resultCreatedRecord = await freedomService.create(TEST_REPO1, { firstName: "Gerrit", lastName: "Cole" });

        
        let error;


        try {
            await freedomService.update(
                TEST_REPO1, 
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
        let refetchechRecord = await freedomService.read(TEST_REPO1, resultCreatedRecord.id);


        assert.equal(refetchechRecord.firstName, "Gerrit");
        assert.equal(refetchechRecord.lastName, "Cole");
    });


    it("Test update: Invalid positive id", async () => {

        //Arrange
        let error;

        try {
            await freedomService.update(
                TEST_REPO1, 
                5000, 
                {
                    firstName: "Charlie",
                    lastName: "Morton"
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
            
            "Invalid positive id"
        );

        
    });
    

    it("Test readByIndex: Read all the records we've written so far", async () => {

        await assertIndexAndRecordMatch(0, {
            id: 1,
            repoId: TEST_REPO1,
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        });

        await assertIndexAndRecordMatch(1, {
            id: 2,
            repoId: TEST_REPO1,
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
            repoId: TEST_REPO1,
            index: 2,
            lastName: 'Polanco',
            firstName: 'Gregory' 
        });

        await assertIndexAndRecordMatch(3, { 
            id: 4,
            owner: accounts[0],
            ipfsCid: 'zdpuApos8UX53uT1Hiwz1ovSB7nUToi2TSz8FQyzMHpQUtWmx',
            repoId: TEST_REPO1,
            index: 3,
            lastName: 'Mercer',
            firstName: 'Jordy' 
        });

        await assertIndexAndRecordMatch(4, { 
            id: 5,
            owner: accounts[0],
            ipfsCid: 'zdpuB3UBv6XoPD8xim1CWuXBNvoXb3heydJfurQ5EQTGHcqAa',
            repoId: TEST_REPO1,
            index: 4,
            lastName: 'Alvarez',
            firstName: 'Pedro' 
        });

        await assertIndexAndRecordMatch(5, { 
            id: 6,
            owner: accounts[0],
            ipfsCid: 'zdpuAynrpuQwgY4DwsDbd4TfPF6pv25f8rcvjnHLCw9j6sp6k',
            repoId: TEST_REPO1,
            index: 5,
            lastName: 'Joyce',
            firstName: 'Matt' 
        });

        await assertIndexAndRecordMatch(6, { 
            id: 7,
            owner: accounts[0],
            ipfsCid: 'zdpuAmRyFGYaKdVmEH3uwqzjv8RdSJmnrABkaSizvAu9JBivG',
            repoId: TEST_REPO1,
            index: 6,
            lastName: 'Morton',
            firstName: 'Charlie' 
        });

        await assertIndexAndRecordMatch(7, { 
            id: 8,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: TEST_REPO1,
            index: 7,
            lastName: 'Cole',
            firstName: 'Gerrit' 
        });


    });

    it("Test readByOwnerIndex: Read all the records we've written so far", async () => {

        await assertOwnerIndexAndRecordMatch(0, {
            id: 1,
            repoId: TEST_REPO1,
            index: 0,
            ipfsCid: "zdpuB31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0],
            firstName: "Andrew",
            lastName: "McCutchen"
        });

        await assertOwnerIndexAndRecordMatch(1, {
            id: 2,
            repoId: TEST_REPO1,
            index: 1,
            ipfsCid: "zdpuAmZw9bUAufGj4rRddtn6Fu1JDkQqt99rJmDerq1z4B1gL",
            owner: accounts[0],
            firstName: "Mark",
            lastName: "Melancon"
        });

        await assertOwnerIndexAndRecordMatch(2, { 
            id: 3,
            owner: accounts[0],
            ipfsCid: 'zdpuAy4MmXJTPVReEWNpqnRJ7JTABiQ6zhXvE9kNcqKi4pL81',
            repoId: TEST_REPO1,
            index: 2,
            lastName: 'Polanco',
            firstName: 'Gregory' 
        });

        await assertOwnerIndexAndRecordMatch(3, { 
            id: 4,
            owner: accounts[0],
            ipfsCid: 'zdpuApos8UX53uT1Hiwz1ovSB7nUToi2TSz8FQyzMHpQUtWmx',
            repoId: TEST_REPO1,
            index: 3,
            lastName: 'Mercer',
            firstName: 'Jordy' 
        });

        await assertOwnerIndexAndRecordMatch(4, { 
            id: 5,
            owner: accounts[0],
            ipfsCid: 'zdpuB3UBv6XoPD8xim1CWuXBNvoXb3heydJfurQ5EQTGHcqAa',
            repoId: TEST_REPO1,
            index: 4,
            lastName: 'Alvarez',
            firstName: 'Pedro' 
        });

        await assertOwnerIndexAndRecordMatch(5, { 
            id: 6,
            owner: accounts[0],
            ipfsCid: 'zdpuAynrpuQwgY4DwsDbd4TfPF6pv25f8rcvjnHLCw9j6sp6k',
            repoId: TEST_REPO1,
            index: 5,
            lastName: 'Joyce',
            firstName: 'Matt' 
        });

        await assertOwnerIndexAndRecordMatch(6, { 
            id: 7,
            owner: accounts[0],
            ipfsCid: 'zdpuAmRyFGYaKdVmEH3uwqzjv8RdSJmnrABkaSizvAu9JBivG',
            repoId: TEST_REPO1,
            index: 6,
            lastName: 'Morton',
            firstName: 'Charlie' 
        });

        await assertOwnerIndexAndRecordMatch(7, { 
            id: 8,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: TEST_REPO1,
            index: 7,
            lastName: 'Cole',
            firstName: 'Gerrit' 
        });


    });

    it("Test readByIndex and readByOwnerIndex: Add record with different owner", async () => {


    });



    it("Test readByIndex: Zero repoId", async () => {

        //Arrange
        let error;

        try {
            await freedomService.readByIndex(0, 0);
        } catch(ex) {
            error = ex;
        }
        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply a repo", 
            testUtils.getRequireMessage(error), 
            "You must supply a repo"
        );

    });

    it("Test readByIndex: Invalid index out of bounds", async () => {

        //Arrange
        let error;

        try {
            await freedomService.readByIndex(TEST_REPO1, 100000);
        } catch(ex) {
            error = ex;
        }
        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "No record at index", 
            testUtils.getRequireMessage(error), 
            "No record at index"
        );

    });
    

    it("Test readByOwnerIndex: Zero repoId", async () => {

        //Arrange
        let error;

        try {
            await freedomService.readByOwnerIndex(0, 0);
        } catch(ex) {
            error = ex;
        }
        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply a repo", 
            testUtils.getRequireMessage(error), 
            "You must supply a repo"
        );

    });

    it("Test readByOwnerIndex: Invalid index out of bounds", async () => {

        //Arrange
        let error;

        try {
            await freedomService.readByOwnerIndex(TEST_REPO1, 100000);
        } catch(ex) {
            error = ex;
        }
        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "No record at index", 
            testUtils.getRequireMessage(error), 
            "No record at index"
        );

    });



    it("Test readList: Limit greater than list size", async () => {
        assert.equal(await freedomService.count(TEST_REPO1), 8, "Count is incorrect");

        let itemList = await freedomService.readList(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 8);
    });


    it("Test readList: Check for duplicates", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await freedomService.create(TEST_REPO1, { firstName: "Gerrit", lastName: "Cole" });
        }

        assert.equal(await freedomService.count(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let limit = 10;

        var foundIds = [];
        for (var i=0; i < 5; i++) {
        
            let recordList = await freedomService.readList(TEST_REPO1, limit, i*limit);

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
        assert.equal(await freedomService.count(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readList(TEST_REPO1, 10, -1);
        } catch(ex) {
           error = ex;
          }


        //Assert
        assert.equal("Negative offset provided. Offset needs to be positive: -1", error, "Error message does not match");


    });

    it("Test callReadList: Offset greater than list size", async () => {

        //Arrange
        assert.equal(await freedomService.count(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await freedomService.readList(TEST_REPO1, 10, 58);
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.equal("Invalid offset provided. Offset must be lower than total number of records: offset: 58, currrentCount: 58", error, "Error message does not match");


    });

    it("Test readList: Negative limit", async () => {

        //Arrange
        assert.equal(await freedomService.count(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readList(TEST_REPO1, -1, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Negative limit given. Limit needs to be positive: -1", error, "Error message does not match");


    });



    it("Test readList: Zero limit", async () => {

        //Arrange
        assert.equal(await freedomService.count(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readList(TEST_REPO1, 0, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Negative limit given. Limit needs to be positive: 0", error, "Error message does not match");


    });
  

    it("Test ipfsPutFile & ipfsGetFile: Save an image then try to get it back out with IPFS directly and verify.", async function() {
      
        //Arrange
        const buffer = fs.readFileSync('test/binary/test-image.jpeg');


        //Act 
        const cid = await freedomService.ipfsPutFile(buffer);


        //Assert
        const result = await freedomService.ipfsGetFile(cid);

        assert.isTrue(buffer.equals(result));
        
    });




    async function assertIndexAndRecordMatch(index, record) {

        let recordAtIndex = await freedomService.readByIndex(TEST_REPO1, index);

        testUtils.assertRecordsMatch(record, recordAtIndex);
    }

    async function assertOwnerIndexAndRecordMatch(index, record) {

        let recordAtIndex = await freedomService.readByOwnerIndex(TEST_REPO1, index);

        testUtils.assertRecordsMatch(record, recordAtIndex);
    }








});