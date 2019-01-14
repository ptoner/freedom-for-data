const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

const TestUtils = require('./test-utils.js');
const Utils = require('../src/utils.js');
const ValidationException = require('../src/exceptions/validation-exception.js');
const Web3Exception = require('../src/exceptions/web3-exception.js');


contract('RecordService', async (accounts) => {

    var testUtils = new TestUtils();
    var utils = new Utils();

    let TEST_REPO1 = 1;

    let recordService;

    before('Setup', async () => {
        serviceFactory.setRecordServiceContract(await serviceFactory.recordServiceContract.deployed());
        recordService = serviceFactory.getRecordService();
    });


    it("Test callReadOwnedList: Get empty list", async () => {

        let itemList = await recordService.callReadOwnedList(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 0);
    });

    it("Test callReadOwnedListDescending: Get empty list", async () => {

        let itemList = await recordService.callReadOwnedListDescending(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 0);

    });


    it("Test callCountOwned: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        //Create records owned by account[0] and then some records by other accounts
        await recordService.sendCreate(TEST_REPO1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ", {from: accounts[0]});
        await recordService.sendCreate(TEST_REPO1, "MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF", {from: accounts[0]});
        await recordService.sendCreate(TEST_REPO1, "GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iB", {from: accounts[1]});
        await recordService.sendCreate(TEST_REPO1, "AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iA", {from: accounts[2]});

        //Act
        let count = await recordService.callCountOwned(TEST_REPO1);

        assert.equal(count, 2);
        
    });


    it("Test callCountOwned: Pass zero repoId", async () => {

        //Act
        try {
            await recordService.callCountOwned(0)
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You must supply a repo",
                testUtils.getRequireMessage(ex),

                "You must supply a repo"
            );
        }


        
    });

    it("Test callCountOwned: Pass positive invalid repoId. Get zero count.", async () => {
        
        //Act
        let count = await recordService.callCountOwned(200);
        
        //Assert
        assert.equal(count, 0);
        
    });

    it("Test readByOwnedIndex: Read the records that are owned by account[0]", async () => {

        // Verify the cids of all the records we added in the above tests
        await assertCallReadByOwnedIndexIpfsCid(TEST_REPO1, 0, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        await assertCallReadByOwnedIndexIpfsCid(TEST_REPO1, 1, "MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF");


        // Make sure that's the end of the list
        try {
            await recordService.callReadByOwnedIndex(TEST_REPO1, 2);
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "No record at index",
                testUtils.getRequireMessage(ex),
                "No record at index"
            );
        }


    });



    it("Test readByOwnedIndex: Zero repoId", async () => {

        //Act
        try {
            await recordService.callReadByOwnedIndex(0, 0);
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You must supply a repo",
                testUtils.getRequireMessage(ex),
                "You must supply a repo"
            );
        }

    });

    it("Test readByOwnedIndex:  Invalid index out of bounds", async () => {

        //Arrange
        let error;

        try {
            await recordService.callReadByOwnedIndex(TEST_REPO1, 1000000);
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "No record at index",
                testUtils.getRequireMessage(ex),
                "No record at index"
            );
        }


    });


    it("Test callReadOwnedList: Limit greater than list size", async () => {
        assert.equal(await recordService.callCountOwned(TEST_REPO1), 2, "Count is incorrect");

        let itemList = await recordService.callReadOwnedList(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 2);
    });


    it("Test callReadOwnedList: Check for duplicates", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await recordService.sendCreate(TEST_REPO1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        }

        assert.equal(await recordService.callCountOwned(TEST_REPO1), 52, "Count is incorrect");


        //Act
        let limit = 10;

        var foundIds = [];
        for (var i=0; i < 5; i++) {

            let recordList = await recordService.callReadOwnedList(TEST_REPO1, limit, i*limit);

            for (record of recordList) {
                if (foundIds.includes(record.id)) {
                    assert.fail("Duplicate ID found in page");
                }

                foundIds.push(record.id);
            }
        }

    });


    it("Test callReadOwnedList: Negative offset", async () => {

        //Act
        try {
            let itemList = await recordService.callReadOwnedList(TEST_REPO1, 10, -1);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {
            //Assert
            assert.equal("Negative offset provided. Offset needs to be positive: -1", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown a ValidationException");
        }

    });

    it("Test callReadOwnedList: Offset greater than list size", async () => {

        //Act
        try {
            let itemList = await recordService.callReadOwnedList(TEST_REPO1, 10, 52);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {

            //Assert
            assert.equal("Invalid offset provided. Offset must be lower than total number of records: offset: 52, currrentCount: 52", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown a ValidationException");
        }

    });

    it("Test callReadOwnedList: Negative limit", async () => {

        //Act
        try {
            let itemList = await recordService.callReadOwnedList(TEST_REPO1, -1, 0);
            assert.fail("Did not throw ValidationException")

        } catch(ex) {
            //Assert
            assert.equal("Negative limit given. Limit needs to be positive: -1", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown a ValidationException");

        }

    });



    it("Test callReadOwnedList: Zero limit", async () => {

        //Arrange
        assert.equal(await recordService.callCountOwned(TEST_REPO1), 52, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await recordService.callReadOwnedList(TEST_REPO1, 0, 0);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {

            //Assert
            assert.equal("Negative limit given. Limit needs to be positive: 0", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown a ValidationException");
        }

    });


    it("Test callReadOwnedListDescending: Verify records already inserted", async () => {

        let records = await recordService.callReadOwnedListDescending(TEST_REPO1, 10, 0)

        assertCompareRecords(records[0], {
            id: 54,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[1], {
            id: 53,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[2], {
            id: 52,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[3], {
            id: 51,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[4], {
            id: 50,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })


        assertCompareRecords(records[5], {
            id: 49,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[6], {
            id: 48,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[7], {
            id: 47,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[8], {
            id: 46,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[9], {
            id: 45,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })


    });


    function assertCompareRecords(record1, record2) {
        assert.equal(record1.id, record2.id)
        assert.equal(record1.owner, record2.owner)
        assert.equal(record1.ipfsCid, record2.ipfsCid)
        assert.equal(record1.repoId, record2.repoId)
    }

    async function assertCallReadByOwnedIndexIpfsCid(repoId, index, ipfsCid) {
        let record = await recordService.callReadByOwnedIndex(repoId, index);
        assert.equal(record.ipfsCid, ipfsCid);
    }

});