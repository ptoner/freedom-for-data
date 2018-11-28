class RecordService {

    constructor(recordServiceContract) {
        this.recordServiceContract = recordServiceContract;
    }

    /**
     * CALLS
     */
    async callRead(id) {
        let resultArray = await this.recordServiceContract.read.call(id);
        return this.recordMapper(id, resultArray);
    }

    async callCount() {
        return this.recordServiceContract.count();
    }


    /**
     * SEND
     */
    async sendCreate(ipfsHash) {
        return this.recordServiceContract.create(ipfsHash);
    }


    /**
     * UTIL
     */
    async recordMapper(id, resultArray) {
        
        return {
            id: id,
            owner: resultArray[0],
            ipfsCid: resultArray[1],
            index: resultArray[2].toNumber()
        }
    }



}

RecordService.prototype = {
    constructor: RecordService,

    
}

module.exports = RecordService;