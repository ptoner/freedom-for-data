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

    async callReadByIndex(index) {
        let resultArray = await this.recordServiceContract.readByIndex.call(index);
        return this.recordMapper(resultArray);
    }

    async callReadList(limit, offset) {

        let currentCount = await this.callCount();

        let items = [];

        if (limit <= 0) {
            throw "Invalid limit provided";
        }

        if (offset < 0 || offset >= currentCount) {
            throw "Invalid offset provided";
        }

        //Calculate end index
        let endIndex; 
        if (offset > 0) {
            endIndex = offset + limit -1;
        } else {
            endIndex = limit - 1; 
        }

        //If it's the last page don't go past the final record
        endIndex = Math.min( currentCount - 1,  endIndex );

        // console.log(`limit: ${limit}, offset: ${offset}, endIndex: ${endIndex}, count: ${currentCount}`);

        for (var i=offset; i <= endIndex; i++) {
            items.push(await this.callReadByIndex(i));
        }

        return items;

    }

    async callCount() {
        let result = await this.recordServiceContract.count.call();
        return result.toNumber();
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
            id: resultArray[0].toNumber(),
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