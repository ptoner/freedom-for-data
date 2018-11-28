
var ServiceFactory = require('../test/ServiceFactory.js');


const serviceFactory = new ServiceFactory();


contract('RecordService', async (accounts) => {

    let createdCount = 0;

    before('Setup', async () => {
        serviceFactory.initializeRecordService(await serviceFactory.RecordService.deployed());
    });


    it("Test sendCreate and callRead: Create a record and verify the info is stored by RecordService contract", async () => {

        //Arrange
        let fakeCid = "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT";

        //Act
        let result = await serviceFactory.getRecordService().sendCreate(fakeCid);
        createdCount++;

        //Assert
        var log = serviceFactory.utils.getLogByEventName("RecordEvent", result.logs);

        //The event just returns the metadata about our created person.
        const createdId = log.args.id.toNumber();

        assert.equal(createdId, 1, "ID should be 1");
        assert.equal(log.args.eventType, "NEW", "Type should be NEW");
        assert.equal(log.args.index.toNumber(), 0, "Index should be 0");
        assert.equal(log.args.ipfsCid, "TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT", "Incorrect IPFS CID");
        assert.equal(log.args.owner, accounts[0], "Owner should be this contract");


        //Also verify with a read.
        let record = await serviceFactory.getRecordService().callRead(createdId);


        //Check that the metadata matches.
        assert.equal(record.id, log.args.id.toNumber(), "Ids need to match");
        assert.equal(record.index, log.args.index.toNumber(), "Indexes should match");
        assert.equal(record.ipfsCid, log.args.ipfsCid, "ipfsHash should match");
        assert.equal(record.owner,accounts[0], "Owner should be this contract");

    });


    it("Test count: Create some records and then call count and make sure it matches", async () => {

        //Arrange
        let result1 = await serviceFactory.getRecordService().sendCreate("TdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        let result2 = await serviceFactory.getRecordService().sendCreate("MdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        let result3 = await serviceFactory.getRecordService().sendCreate("GdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        let result4 = await serviceFactory.getRecordService().sendCreate("AdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");
        let result5 = await serviceFactory.getRecordService().sendCreate("RdLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78iT");

        createdCount += 5;

        //Act
        let count = await serviceFactory.getRecordService().callCount();

        assert.equal(count, createdCount);
        
    });

    it("Test update: Update a record with a new IPFS cid and make sure the changes are saved.", async () => {
        
        //Arrange
        let result = await serviceFactory.getRecordService().sendCreate("VXLTM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b78MQ");

        var log = serviceFactory.utils.getLogByEventName("RecordEvent", result.logs);
        const createdId = log.args.id.toNumber();
        
        //Act
        await serviceFactory.getRecordService().sendUpdate(createdId, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB");


        //Assert
        let refetchechRecord = await serviceFactory.getRecordService().callRead(createdId);


        assert.equal(refetchechRecord.ipfsCid, "CRLuM31DmfwJYHi9FJPoSqLf9fepy6o2qcdk88t9w395b7ViB")


    });
    
    it("Test update: Update a record we don't own. Make sure we can't change them. ", async () => {

        
    });

});