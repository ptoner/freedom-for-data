function RecordService(recordServiceContract) {
    this.recordServiceContract = recordServiceContract;
}

RecordService.prototype = {
    constructor: RecordService,

    /**
     * CALLS
     */
    callRead: async function(id) {
        let resultArray = await this.recordServiceContract.read.call(id);
        return this.recordMapper(id, resultArray);
    },




    /**
     * SEND
     */
    sendCreate: async function(ipfsHash) {
        return this.recordServiceContract.create(ipfsHash);
    },



    /**
     * UTIL
     */
    recordMapper: function(id, resultArray) {
        
        return {
            id: id,
            owner: resultArray[0],
            ipfsCid: resultArray[1],
            index: resultArray[2].toNumber()
        }
    }

}

module.exports = RecordService;