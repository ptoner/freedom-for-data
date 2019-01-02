const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');
var Utils = require('../src/utils.js');

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
            index: 0,
            ipfsCid: "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT",
            owner: accounts[0]
        })


        //Also verify with a read.
        let record = await recordService.callRead(TEST_REPO1, loggedRecord.id);


        //Check that the metadata matches.
        assert.equal(record.id, loggedRecord.id, "Ids need to match");
        assert.equal(record.index, loggedRecord.index, "Indexes should match");
        assert.equal(record.ipfsCid, loggedRecord.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

    });

    it("Test sendCreate: Try with an account that's not the owner. Should throw an exception.", async () => {
        
        //Arrange
        let error;


        try {
            let result = await recordService.sendCreate(
                TEST_REPO1, 
                "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB",
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
        let error;


        try {
            let result = await recordService.sendCreate(0, "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB");
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


    it("Test sendCreate: Blank ipfsCid. Should throw an error.", async () => {
        
        //Arrange
        let error;

        try {
            let result = await recordService.sendCreate(TEST_REPO1, "");
        } catch(ex) {
            error = ex;
        }

        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply an ipfsCid -- Reason given: You must supply an ipfsCid.", 
            testUtils.getRequireMessage(error), 
            
            "Supply a non-empty ipfsCid"
        );

    });


    it("Test callRead: Zero repoId", async () => {
        
        //Arrange
        let error;

        try {
            let result = await recordService.callRead(0, 1);
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

    it("Test callRead: Zero id", async () => {
        
        //Arrange
        let error;

        try {
            let result = await recordService.callRead(1, 0);
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

    it("Test callRead: Invalid positive id", async () => {
        
        //Arrange
        let error;

        try {
            let result = await recordService.callRead(1, 5000);
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

    it("Test callCountOwner: Make sure it matches", async () => {

        //Act
        let count = await recordService.callCountOwner(TEST_REPO1);

        assert.equal(count, createdCount);
        
    });


    it("Test callCount: Pass zero repoId", async () => {
        //Act

        let error;
        try {
            await recordService.callCount(0)
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


    it("Test callCountOwner: Pass zero repoId", async () => {
        //Act

        let error;
        try {
            await recordService.callCountOwner(0)
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

    it("Test callCount: Pass positive invalid repoId. Get zero count.", async () => {
        
        //Act
        let count = await recordService.callCount(200);
        
        //Assert
        assert.equal(count, 0);
        
    });

    it("Test callCountOwner: Pass positive invalid repoId. Get zero count.", async () => {
        
        //Act
        let count = await recordService.callCountOwner(200);
        
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


        let error;


        try {
            await recordService.sendUpdate(
                TEST_REPO1,
                loggedRecord.id, 
                "CELTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MN",
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
        let refetchechRecord = await recordService.callRead(TEST_REPO1, loggedRecord.id);


        assert.equal(refetchechRecord.ipfsCid, "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB"); //the original one
        
    });


    it("Test sendUpdate: Invalid positive id", async () => {

        //Arrange
        let error;

        try {
            await recordService.sendUpdate(
                TEST_REPO1,
                5000, 
                "CELTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MN"
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

    it("Test sendUpdate: Blank IPFS cid", async () => {

        //Arrange
        let error;

        try {
            await recordService.sendUpdate(
                TEST_REPO1,
                1, 
                ""
            )
        } catch(ex) {
            error = ex;
        }
        //Assert
        assert.isTrue(error instanceof Error, "Should have thrown an error");
        assert.equal(
            "You must supply an ipfsCid -- Reason given: You must supply an ipfsCid.", 
            testUtils.getRequireMessage(error), 
            "You must supply an ipfsCid"
        );

        
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

    it("Test readByOwnerIndex: Read all the records we've written so far", async() => {

        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 0, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 2, "MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF");
        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 3, "GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iB");
        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 4, "AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iA");
        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 5, "RdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iY");
        await assertCallReadByOwnerIndexIpfsCid(TEST_REPO1, 6, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB");

    });




    it("Test readByIndex: Zero repoId", async () => {

        //Arrange
        let error;

        try {
            await recordService.callReadByIndex(0, 0);
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

    it("Test readByIndex:  Invalid index out of bounds", async () => {

        //Arrange
        let error;

        try {
            await recordService.callReadByIndex(TEST_REPO1, 1000000);
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
            await recordService.callReadByOwnerIndex(0, 0);
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

    it("Test readByOwnerIndex:  Invalid index out of bounds", async () => {

        //Arrange
        let error;

        try {
            await recordService.callReadByOwnerIndex(TEST_REPO1, 1000000);
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

        //Arrange
        assert.equal(await recordService.callCount(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await recordService.callReadList(TEST_REPO1, 10, -1);
        } catch(ex) {
           error = ex;
          }


        //Assert
        assert.equal("Negative offset provided. Offset needs to be positive: -1", error, "Error message does not match");


    });

    it("Test callReadList: Offset greater than list size", async () => {

        //Arrange
        assert.equal(await recordService.callCount(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await recordService.callReadList(TEST_REPO1, 10, 58);
        } catch(ex) {
            error = ex;
        }

        

        //Assert
        assert.equal("Invalid offset provided. Offset must be lower than total number of records: offset: 58, currrentCount: 58", error, "Error message does not match");


    });

    it("Test callReadList: Negative limit", async () => {

        //Arrange
        assert.equal(await recordService.callCount(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await recordService.callReadList(TEST_REPO1, -1, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Negative limit given. Limit needs to be positive: -1", error, "Error message does not match");


    });



    it("Test callReadList: Zero limit", async () => {

        //Arrange
        assert.equal(await recordService.callCount(TEST_REPO1), 58, "Count is incorrect");


        //Act
        let error;

        try {
            let itemList = await recordService.callReadList(TEST_REPO1, 0, 0);
        } catch(ex) {
            error = ex;
        }


        //Assert
        assert.equal("Negative limit given. Limit needs to be positive: 0", error, "Error message does not match");


    });


    async function assertCallReadByIndexIpfsCid(repoId, index, ipfsCid) {
        let record = await recordService.callReadByIndex(repoId, index);
        assert.equal(record.ipfsCid, ipfsCid);
    }

    async function assertCallReadByOwnerIndexIpfsCid(repoId, index, ipfsCid) {
        let record = await recordService.callReadByOwnerIndex(repoId, index);
        assert.equal(record.ipfsCid, ipfsCid);
    }


});