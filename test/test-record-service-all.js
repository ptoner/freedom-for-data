const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');
var Utils = require('../src/utils.js');

const Web3Exception = require('../src/exceptions/web3-exception.js');
const ValidationException = require('../src/exceptions/validation-exception.js');

contract('RecordService', async (accounts) => {

    var testUtils = new TestUtils();
    var utils = new Utils();

    let createdCount = 0;

    let TEST_REPO1 = 1;

    let recordService;

    before('Setup', async () => {
        serviceFactory.setRecordServiceContract(await serviceFactory.recordServiceContract.deployed());
        recordService = serviceFactory.getRecordService();
    });

    it("Test callCount: Get a count before there are records", async () => {

        //Act
        let count = await recordService.callCount(TEST_REPO1);

        assert.equal(0, count);

    });


    it("Test callReadList: Get empty list", async () => {

        let itemList = await recordService.callReadList(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 0);
    });

    it("Test callReadListDescending: Get empty list", async () => {

        let itemList = await recordService.callReadListDescending(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 0);

    });

    it("Test sendCreate and callRead: Create a record and verify the info is stored by RecordService contract", async () => {

        //Arrange
        let fakeCid = "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT";

        //Act
        let result = await recordService.sendCreate(TEST_REPO1, fakeCid);
        createdCount++;

        //Assert
        var loggedRecord = utils.recordEventToRecord(result);


        //Verify the logged record
        testUtils.assertRecordsMatch(loggedRecord, {
            id: 1,
            eventType: "NEW",
            ipfsCid: "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0]
        })


        //Also verify with a read.
        let record = await recordService.callRead(TEST_REPO1, loggedRecord.id);


        //Check that the metadata matches.
        assert.equal(record.id, loggedRecord.id, "Ids need to match");
        assert.equal(record.ipfsCid, loggedRecord.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

    });

    it("Test sendCreate: Zero repoId", async () => {

        //Act
        try {
            let result = await recordService.sendCreate(0, "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB");
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {

            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown a Web3Exception");
            assert.equal(
                "You must supply a repo -- Reason given: You must supply a repo.",
                testUtils.getRequireMessage(ex),

                "Should fail to let non-owner call create"
            );
        }



    });

    it("Test sendCreate: Blank ipfsCid. Should throw an error.", async () => {
        
        //Act
        try {
            let result = await recordService.sendCreate(TEST_REPO1, "");
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {

            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You must supply an ipfsCid -- Reason given: You must supply an ipfsCid.",
                testUtils.getRequireMessage(ex),

                "Supply a non-empty ipfsCid"
            );        }



    });

    it("Test callRead: Zero repoId", async () => {
        
        //ACT
        try {
            let result = await recordService.callRead(0, 1);
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You must supply a repo",
                testUtils.getRequireMessage(ex),
                "Supply a non-empty repo"
            );
        }



    });

    it("Test callRead: Zero id", async () => {

        //Act
        try {
            let result = await recordService.callRead(1, 0);
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You must supply an id",
                testUtils.getRequireMessage(ex),

                "Supply an id"
            );
        }



    });

    it("Test callRead: Invalid positive id", async () => {
        
        //Act
        try {
            let result = await recordService.callRead(1, 5000);
            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "No record found",
                testUtils.getRequireMessage(ex),
                "No record found"
            );
        }



    });

    it("Test callCount: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        let result1 = await recordService.sendCreate(TEST_REPO1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        let result2 = await recordService.sendCreate(TEST_REPO1, "MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF");
        let result3 = await recordService.sendCreate(TEST_REPO1, "GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iB");
        let result4 = await recordService.sendCreate(TEST_REPO1, "AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iA");
        let result5 = await recordService.sendCreate(TEST_REPO1, "RdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iY");

        createdCount += 5;

        //Act
        let count = await recordService.callCount(TEST_REPO1);

        assert.equal(count, createdCount);
        
    });

    it("Test callCount: Pass zero repoId", async () => {

        //Act
        try {
            await recordService.callCount(0)
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

    it("Test callCount: Pass positive invalid repoId. Get zero count.", async () => {
        
        //Act
        let count = await recordService.callCount(200);
        
        //Assert
        assert.equal(count, 0);
        
    });

    it("Test sendUpdate: Update a record with a new IPFS cid and make sure the changes are saved.", async () => {
        
        //Arrange
        let result = await recordService.sendCreate(TEST_REPO1, "VXLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");

        var log = utils.getLogByEventName("RecordEvent", result.logs);
        const createdId = log.args.id.toNumber();
        
        //Act
        await recordService.sendUpdate(TEST_REPO1, createdId, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB");


        //Assert
        let refetchechRecord = await recordService.callRead(TEST_REPO1, createdId);


        assert.equal(refetchechRecord.ipfsCid, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB")


    });
    
    it("Test sendUpdate: Update a record we don't own. Make sure we can't change them. ", async () => {

        //Arrange
        let result = await recordService.sendCreate(TEST_REPO1, "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB");

        //Get record from result
        var loggedRecord = utils.recordEventToRecord(result);


        try {
            await recordService.sendUpdate(
                TEST_REPO1,
                loggedRecord.id, 
                "CELTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MN",
                {
                    from: accounts[1]
                }
            )

            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You don't own this record -- Reason given: You don't own this record.",
                testUtils.getRequireMessage(ex),

                "Should fail to update record user doesn't own."
            );
        }


        //Do a read and make sure it shows the original value
        let refetchechRecord = await recordService.callRead(TEST_REPO1, loggedRecord.id);


        assert.equal(refetchechRecord.ipfsCid, "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB"); //the original one
        
    });

    it("Test sendUpdate: Invalid positive id", async () => {

        //Act
        try {
            await recordService.sendUpdate(
                TEST_REPO1,
                5000, 
                "CELTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MN"
            )

            assert.fail("Did not throw Web3Exception")

        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You don't own this record -- Reason given: You don't own this record.",
                testUtils.getRequireMessage(ex),

                "Invalid positive id"
            );
        }

    });

    it("Test sendUpdate: Blank IPFS cid", async () => {

        //Act
        try {
            await recordService.sendUpdate(
                TEST_REPO1,
                1, 
                ""
            )

            assert.fail("Did not throw Web3Exception")
        } catch(ex) {
            //Assert
            assert.isTrue(ex instanceof Web3Exception, "Should have thrown an error");
            assert.equal(
                "You must supply an ipfsCid -- Reason given: You must supply an ipfsCid.",
                testUtils.getRequireMessage(ex),
                "You must supply an ipfsCid"
            );
        }


        
    });

    it("Test readByIndex: Read all the records we've written so far", async () => {

        // Verify the cids of all the records we added in the above tests
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 0, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 2, "MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF");
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 3, "GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iB");
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 4, "AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iA");
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 5, "RdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iY");
        await assertCallReadByIndexIpfsCid(TEST_REPO1, 6, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB");
    });

    it("Test readByIndex: Zero repoId", async () => {

        //Act
        try {
            await recordService.callReadByIndex(0, 0);
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

    it("Test readByIndex:  Invalid index out of bounds", async () => {

        //Act
        try {
            await recordService.callReadByIndex(TEST_REPO1, 1000000);
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

    it("Test callReadList: Limit greater than list size", async () => {
        assert.equal(await recordService.callCount(TEST_REPO1), 8, "Count is incorrect");

        let itemList = await recordService.callReadList(TEST_REPO1, 10, 0);

        assert.equal(itemList.length, 8);
    });

    it("Test callReadList: Check for duplicates", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await recordService.sendCreate(TEST_REPO1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        }

        assert.equal(await recordService.callCount(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let limit = 10;

        var foundIds = [];
        for (var i=0; i < 5; i++) {

            let recordList = await recordService.callReadList(TEST_REPO1, limit, i*limit);

            for (record of recordList) {
                if (foundIds.includes(record.id)) {
                    assert.fail("Duplicate ID found in page");
                }

                foundIds.push(record.id);
            }
        }

    });

    it("Test callReadList: Negative offset", async () => {

        try {
            let itemList = await recordService.callReadList(TEST_REPO1, 10, -1);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {
            //Assert
            assert.equal("Negative offset provided. Offset needs to be positive: -1", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");
        }

    });

    it("Test callReadList: Offset greater than list size", async () => {

        //Act
        try {
            let itemList = await recordService.callReadList(TEST_REPO1, 10, 58);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {
            assert.equal("Invalid offset provided. Offset must be lower than total number of records: offset: 58, currrentCount: 58", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");
        }

    });

    it("Test callReadList: Negative limit", async () => {

        //Act
        try {
            let itemList = await recordService.callReadList(TEST_REPO1, -1, 0);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {

            //Assert
            assert.equal("Negative limit given. Limit needs to be positive: -1", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");

        }

    });

    it("Test callReadList: Zero limit", async () => {

        //Act
        try {
            let itemList = await recordService.callReadList(TEST_REPO1, 0, 0);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {
            //Assert
            assert.equal("Negative limit given. Limit needs to be positive: 0", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");
        }






    });

    it("Test validateLimitOffset: Negative offset", async () => {

        //Act
        try {
            let itemList = recordService.validateLimitOffset(10, -1, 10);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {
            //Assert
            assert.equal("Negative offset provided. Offset needs to be positive: -1", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");

        }

    });

    it("Test validateLimitOffset: Offset greater than list size", async () => {

        //Act
        try {
            let itemList = recordService.validateLimitOffset(10, 10, 10);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {

            //Assert
            assert.equal("Invalid offset provided. Offset must be lower than total number of records: offset: 10, currrentCount: 10", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");
        }



    });

    it("Test validateLimitOffset: Negative limit", async () => {

        //Act
        let error;

        try {
            let itemList = recordService.validateLimitOffset(-1, 0, 5);
            assert.fail("Did not throw ValidationException")
        } catch(ex) {
            //Assert
            assert.equal("Negative limit given. Limit needs to be positive: -1", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");
        }


    });

    it("Test validateLimitOffset: Zero limit", async () => {

        //Act
        let error;

        try {
            let itemList = recordService.validateLimitOffset(0, 0, 10);
            assert.fail("Did not throw ValidationException")

        } catch(ex) {

            //Assert
            assert.equal("Negative limit given. Limit needs to be positive: 0", ex.message, "Error message does not match");
            assert.isTrue(ex instanceof ValidationException, "Should have thrown ValidationException");


        }




    });

    it ("Test validateLimitOffset: No records", async () => {

        recordService.validateLimitOffset(10, 0, 0)

    });

    it("Test calculateEndIndex: Positive values", async () => {

        assert.equal(recordService.calculateEndIndex(10, 0, 50), 9);
        assert.equal(recordService.calculateEndIndex(10, 0, 5), 4);
        assert.equal(recordService.calculateEndIndex(10, 3, 5), 4);

        //TODO: Expand these tests

    });

    it("Test calculateDescendingOffset: Positive values", async () => {

        assert.equal(recordService.calculateDescendingOffset(0, 100), 99);
        assert.equal(recordService.calculateDescendingOffset(9, 100), 90);
        assert.equal(recordService.calculateDescendingOffset(19, 100), 80);
        assert.equal(recordService.calculateDescendingOffset(29, 100), 70);
        assert.equal(recordService.calculateDescendingOffset(39, 100), 60);
        assert.equal(recordService.calculateDescendingOffset(49, 100), 50);
        assert.equal(recordService.calculateDescendingOffset(59, 100), 40);
        assert.equal(recordService.calculateDescendingOffset(69, 100), 30);
        assert.equal(recordService.calculateDescendingOffset(79, 100), 20);
        assert.equal(recordService.calculateDescendingOffset(89, 100), 10);
        assert.equal(recordService.calculateDescendingOffset(99, 100), 0);

        assert.equal(recordService.calculateDescendingOffset(0, 0), 0);

    });

    it("Test calculateDescendingOffset: Negative values", async () => {
        assert.equal(recordService.calculateDescendingOffset(100, 100), 0);
        assert.equal(recordService.calculateDescendingOffset(105, 100), 0);

    });

    it("Test calculateDescendingEndIndex: Positive values", async () => {
        assert.equal(recordService.calculateDescendingEndIndex(10, 0), 0);
        assert.equal(recordService.calculateDescendingEndIndex(10, 9), 0);
        assert.equal(recordService.calculateDescendingEndIndex(10, 19), 10);
        assert.equal(recordService.calculateDescendingEndIndex(10, 29), 20);
    });

    it("Test callReadListDescending: Verify records already inserted", async () => {

        let records = await recordService.callReadListDescending(TEST_REPO1, 10, 0)

        assertCompareRecords(records[0], {
            id: 58,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[1], {
            id: 57,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[2], {
            id: 56,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[3], {
            id: 55,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[4], {
            id: 54,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })


        assertCompareRecords(records[5], {
            id: 53,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[6], {
            id: 52,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[7], {
            id: 51,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[8], {
            id: 50,
            owner: accounts[0],
            ipfsCid: 'TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ',
            repoId: 1
        })

        assertCompareRecords(records[9], {
            id: 49,
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

    async function assertCallReadByIndexIpfsCid(repoId, index, ipfsCid) {
        let record = await recordService.callReadByIndex(repoId, index);
        assert.equal(record.ipfsCid, ipfsCid);
    }

});