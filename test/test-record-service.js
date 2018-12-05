const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

var TestUtils = require('./test-utils.js');
var Utils = require('../src/utils.js');

contract('RecordService', async (accounts) => {

    var testUtils = new TestUtils();
    var utils = new Utils();

    let createdCount = 0;

    let recordService;

    before('Setup', async () => {
        serviceFactory.setRecordServiceContract(await serviceFactory.recordServiceContract.deployed());
        recordService = serviceFactory.getRecordService();
    });


    it("Test sendCreate and callRead: Create a record and verify the info is stored by RecordService contract", async () => {

        //Arrange
        let fakeCid = "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT";

        //Act
        let result = await recordService.sendCreate(fakeCid);
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
        let record = await recordService.callRead(loggedRecord.id);


        //Check that the metadata matches.
        assert.equal(record.id, loggedRecord.id, "Ids need to match");
        assert.equal(record.index, loggedRecord.index, "Indexes should match");
        assert.equal(record.ipfsCid, loggedRecord.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

    });


    it("Test count: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        let result1 = await recordService.sendCreate("TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        let result2 = await recordService.sendCreate("MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF");
        let result3 = await recordService.sendCreate("GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iB");
        let result4 = await recordService.sendCreate("AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iA");
        let result5 = await recordService.sendCreate("RdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iY");

        createdCount += 5;

        //Act
        let count = await recordService.callCount();

        assert.equal(count, createdCount);
        
    });

    it("Test update: Update a record with a new IPFS cid and make sure the changes are saved.", async () => {
        
        //Arrange
        let result = await recordService.sendCreate("VXLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");

        var log = utils.getLogByEventName("RecordEvent", result.logs);
        const createdId = log.args.id.toNumber();
        
        //Act
        await recordService.sendUpdate(createdId, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB");


        //Assert
        let refetchechRecord = await recordService.callRead(createdId);


        assert.equal(refetchechRecord.ipfsCid, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB")


    });
    
    it("Test update: Update a record we don't own. Make sure we can't change them. ", async () => {

        //Arrange
        let result = await recordService.sendCreate("KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB");

        //Get record from result
        var loggedRecord = utils.recordEventToRecord(result);


        let error;


        try {
            await recordService.sendUpdate(
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
        let refetchechRecord = await recordService.callRead(loggedRecord.id);


        assert.equal(refetchechRecord.ipfsCid, "KNLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MB"); //the original one
        
    });



    it("Test readByIndex: Read all the records we've written so far", async () => {

        // Verify the cids of all the records we added in the above tests
        await assertCidMatch(0, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        await assertCidMatch(1, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        await assertCidMatch(2, "MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iF");
        await assertCidMatch(3, "GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iB");
        await assertCidMatch(4, "AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iA");
        await assertCidMatch(5, "RdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iY");
        await assertCidMatch(6, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB");
    });


    it("Test callReadItemList: Check for duplicates", async () => {

        //Arrange
        for (var i=0; i < 50; i++) {
            await recordService.sendCreate("TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");
        }

        assert.equal(await recordService.callCount(), 58, "Count is incorrect");




        //Act
        let limit = 10;

        var foundIds = [];
        for (var i=0; i < 5; i++) {

            let recordList = await recordService.callReadItemList(limit, i*limit);

            for (record of recordList) {
                if (foundIds.includes(record.id)) {
                    assert.fail("Duplicate ID found in page");
                }

                foundIds.push(record.id);
            }
        }

    });




    async function assertCidMatch(index, ipfsCid) {
        let record = await recordService.callReadByIndex(index);
        assert.equal(record.ipfsCid, ipfsCid);
    }


});