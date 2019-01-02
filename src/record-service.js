class RecordService {

    constructor(recordServiceContract) {
        this.recordServiceContract = recordServiceContract;
    }

    /**
     * CALLS
     */
    async callRead(repoId, id) {
        let resultArray = await this.recordServiceContract.read.call(repoId, id);
        return this.recordMapper(resultArray);
    }

    async callReadByOwnerIndex(repoId, index) {
        let resultArray = await this.recordServiceContract.readByOwnerIndex.call(repoId, index);
        return this.recordMapper(resultArray);
    }

    async callReadByIndex(repoId, index) {
        let resultArray = await this.recordServiceContract.readByIndex.call(repoId, index);
        return this.recordMapper(resultArray);
    }

    async callReadList(repoId, limit, offset) {

        let currentCount = await this.callCount(repoId);

        let items = [];

        if (limit <= 0) {
            throw `Negative limit given. Limit needs to be positive: ${limit}`;
        }

        if (offset < 0) {
            throw `Negative offset provided. Offset needs to be positive: ${offset}`;
        }

        if (offset >= currentCount) {
            throw `Invalid offset provided. Offset must be lower than total number of records: offset: ${offset}, currrentCount: ${currentCount}`;
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
            items.push(await this.callReadByIndex(repoId, i));
        }

        return items;

    }

    async callCount(repoId) {
        let result = await this.recordServiceContract.count.call(repoId);
        return result.toNumber();
    }

    async callCountOwner(repoId) {
        let result = await this.recordServiceContract.countOwner.call(repoId);
        return result.toNumber();
    }

    /**
     * SEND
     */
    async sendCreate(repoId, ipfsCid, transactionObject) {      
        if (transactionObject) {
            return this.recordServiceContract.create(repoId, ipfsCid, transactionObject);
        }
        
        return this.recordServiceContract.create(repoId, ipfsCid);

    }

    async sendUpdate(repoId, id, ipfsCid, transactionObject) {      
        
        if (transactionObject) {
            return this.recordServiceContract.update(repoId, id, ipfsCid, transactionObject);
        }

        return this.recordServiceContract.update(repoId, id, ipfsCid);
        
    }


    /**
     * UTIL
     */
    async recordMapper(resultArray) {
        
        return {
            id: resultArray[0].toNumber(),
            owner: resultArray[1],
            ipfsCid: resultArray[2],
            repoId: resultArray[3].toNumber(),
            index: resultArray[4].toNumber()
        }
    }



}



module.exports = RecordService;