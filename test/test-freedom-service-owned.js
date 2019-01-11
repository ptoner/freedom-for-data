const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');

const fs = require('fs');



contract('FreedomService', async (accounts) => {

    var testUtils = new TestUtils();

    let TEST_REPO1 = 1;
   
    let freedomService;

    before('Setup', async () => {
        serviceFactory.setRecordServiceContract(await serviceFactory.recordServiceContract.deployed());
        freedomService = serviceFactory.getFreedomService();
    });


    it("Test count: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        await freedomService.create(TEST_REPO1, { firstName: "Mark", lastName: "Melancon" }, {from: accounts[0]});
        await freedomService.create(TEST_REPO1, { firstName: "Gregory", lastName: "Polanco" }, {from: accounts[0]});
        await freedomService.create(TEST_REPO1, { firstName: "Jordy", lastName: "Mercer" }, {from: accounts[1]});
        await freedomService.create(TEST_REPO1, { firstName: "Pedro", lastName: "Alvarez" }, {from: accounts[2]});


        //Act
        let count = await freedomService.countOwned(TEST_REPO1);

        assert.equal(count, 2);

    });


    it("Test count: Pass zero repoId", async () => {
        //Act

        let error;
        try {
            await freedomService.countOwned(0)
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
        let count = await freedomService.countOwned(200);
        
        //Assert
        assert.equal(count, 0);
        
    });


    it("Test readByIndexOwned: Read the records we've written so far", async () => {

        await assertIndexAndRecordMatch(0, {
            id: 1,
            repoId: TEST_REPO1,
            ipfsCid: "zdpuAmZw9bUAufGj4rRddtn6Fu1JDkQqt99rJmDerq1z4B1gL",
            owner: accounts[0],
            firstName: "Mark",
            lastName: "Melancon"
        });

        await assertIndexAndRecordMatch(1, { 
            id: 2,
            owner: accounts[0],
            ipfsCid: 'zdpuAy4MmXJTPVReEWNpqnRJ7JTABiQ6zhXvE9kNcqKi4pL81',
            repoId: TEST_REPO1,
            lastName: 'Polanco',
            firstName: 'Gregory' 
        });


    });


    it("Test readByIndexOwned: Zero repoId", async () => {

        //Arrange
        let error;

        try {
            await freedomService.readByOwnedIndex(0, 0);
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

    it("Test readByIndexOwned: Invalid index out of bounds", async () => {

        //Arrange
        let error;

        try {
            await freedomService.readByOwnedIndex(TEST_REPO1, 100000);
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
    


    it("Test readOwnedList: Limit greater than list size", async () => {
        assert.equal(await freedomService.countOwned(TEST_REPO1), 2, "Count is incorrect");

        let itemList = await freedomService.readOwnedList(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 2);
    });


    it("Test readOwnedList: Check for duplicates", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await freedomService.create(TEST_REPO1, { firstName: "Gerrit", lastName: "Cole" });
        }

        assert.equal(await freedomService.countOwned(TEST_REPO1), 52, "Count is incorrect");


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


    it("Test readOwnedList: Negative offset", async () => {

        //Arrange
        assert.equal(await freedomService.countOwned(TEST_REPO1), 52, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readOwnedList(TEST_REPO1, 10, -1);
        } catch(ex) {
           error = ex;
          }


        //Assert
        assert.equal("Negative offset provided. Offset needs to be positive: -1", error, "Error message does not match");


    });

    it("Test readOwnedList: Offset greater than list size", async () => {

        //Arrange
        assert.equal(await freedomService.countOwned(TEST_REPO1), 52, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await freedomService.readOwnedList(TEST_REPO1, 10, 52);
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.equal("Invalid offset provided. Offset must be lower than total number of records: offset: 52, currrentCount: 52", error, "Error message does not match");


    });

    it("Test readOwnedList: Negative limit", async () => {

        //Arrange
        assert.equal(await freedomService.countOwned(TEST_REPO1), 52, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readOwnedList(TEST_REPO1, -1, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Negative limit given. Limit needs to be positive: -1", error, "Error message does not match");


    });



    it("Test readOwnedList: Zero limit", async () => {

        //Arrange
        assert.equal(await freedomService.countOwned(TEST_REPO1), 52, "Count is incorrect");


        //Act
        let error;

        try {
            let results = await freedomService.readOwnedList(TEST_REPO1, 0, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Negative limit given. Limit needs to be positive: 0", error, "Error message does not match");


    });


    it("Test readOwnedListDescending: Verify records already inserted", async () => {

        let records = await freedomService.readOwnedListDescending(TEST_REPO1, 10, 0)


        testUtils.assertRecordsMatch(records[0], {
            id: 54,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[1], {
            id: 53,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[2], {
            id: 52,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[3], {
            id: 51,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[4], {
            id: 50,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[5], {
            id: 49,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[6], {
            id: 48,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[7], {
            id: 47,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[8], {
            id: 46,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });

        testUtils.assertRecordsMatch(records[9], {
            id: 45,
            owner: accounts[0],
            ipfsCid: 'zdpuAxYoviWmkBkQf32U1RXyG2tNK4ajMtdVa456hJt6wgLac',
            repoId: 1,
            lastName: 'Cole',
            firstName: 'Gerrit'
        });


    });


    async function assertIndexAndRecordMatch(index, record) {

        let recordAtIndex = await freedomService.readByOwnedIndex(TEST_REPO1, index);

        // console.log("assertIndexAndRecordMatch");
        // console.log("Record:");
        // console.log(record);
        // console.log("Record at index:" + index);
        // console.log(recordAtIndex);
        // console.log('---------------');

        testUtils.assertRecordsMatch(record, recordAtIndex);
    }


});