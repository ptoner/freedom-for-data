class RecordService {

    constructor(recordServiceContract) {
        this.recordServiceContract = recordServiceContract;
    }

    /**
     * CALLS
     */
    async callRead(id) {
        let resultArray = await this.recordServiceContract.read.call(id);
        return this.recordMapper(resultArray);
    }

    // async callReadByIndex(index) {

    //     var self = this;

    //     let resultArray = await self.recordServiceContract.readByIndex.call(index);
    //     return self.recordMapper(resultArray);
    // }

    async callCount() {
        return this.recordServiceContract.count();
    }


    /**
     * SEND
     */
    async sendCreate(ipfsCid, transactionObject) {      
        if (transactionObject) {
            return this.recordServiceContract.create(ipfsCid, transactionObject);
        }
        
        return this.recordServiceContract.create(ipfsCid);

    }

    async sendUpdate(id, ipfsCid, transactionObject) {      
        
        if (transactionObject) {
            return this.recordServiceContract.update(id, ipfsCid, transactionObject);
        }

        return this.recordServiceContract.update(id, ipfsCid);
        
    }


    /**
     * UTIL
     */
    async recordMapper(resultArray) {
        
        return {
            id: resultArray[0],
            owner: resultArray[1],
            ipfsCid: resultArray[2],
            index: resultArray[3].toNumber()
        }
    }



}

RecordService.prototype = {
    constructor: RecordService,

    
}

module.exports = RecordService;