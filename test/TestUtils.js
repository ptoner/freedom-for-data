class TestUtils {
    constructor() {

    }


    getRequireMessage(ex) {
        // return ex.message.substr(43);
        // return ex.message;
        return ex.message.substr(ex.message.lastIndexOf(": revert")+8).trim();
    }

    
    assertRecordsMatch(record1, record2) {
        //Assert
        assert.equal(record1.id, record2.id, "IDs should match");
        assert.equal(record1.eventType, record2.eventType, "Type should match");
        assert.equal(record1.index, record2.index, "Index should match");
        assert.equal(record1.ipfsCid, record2.ipfsCid, "IPFS cid should match");
        assert.equal(record1.owner, record2.owner, "Owner should match");

        //Check saved fields
        assert.equal(record1.firstName, record2.firstName, "Incorrect firstName value");
        assert.equal(record1.lastName, record2.lastName, "Incorrect lastName value");
    }


    

}

module.exports = TestUtils;