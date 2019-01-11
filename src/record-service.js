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

    async callReadByOwnedIndex(repoId, index) {
        let resultArray = await this.recordServiceContract.readByOwnedIndex.call(repoId, index);
        return this.recordMapper(resultArray);
    }

    async callReadByIndex(repoId, index) {
        let resultArray = await this.recordServiceContract.readByIndex.call(repoId, index);
        return this.recordMapper(resultArray);
    }

    async callReadList(repoId, limit, offset, ascending=true) {

        let currentCount = await this.callCount(repoId);

        let items = [];


        this.validateLimitOffset(limit, offset, currentCount);


        //Calculate end index
        let endIndex = this.calculateEndIndex(limit, offset, currentCount);

        // console.log(`limit: ${limit}, offset: ${offset}, endIndex: ${endIndex}, count: ${currentCount}`);

        for (var i=offset; i <= endIndex; i++) {
            items.push(await this.callReadByIndex(repoId, i));
        }

        return items;

    }

    async callReadListDescending(repoId, limit, offset) {

        let currentCount = await this.callCount(repoId);

        //Adjust the offset to start at the end of the list.
        let calculatedOffset = this.calculateDescendingOffset(offset, currentCount);


        let items = [];

        this.validateLimitOffset(limit, calculatedOffset, currentCount);


        //Calculate end index
        let endIndex = this.calculateDescendingEndIndex(limit, calculatedOffset);

        // console.log(`limit: ${limit}, offset: ${calculatedOffset}, endIndex: ${endIndex}, count: ${currentCount}`);


        for (var i=calculatedOffset; i >= endIndex; i--) {
            items.push(await this.callReadByIndex(repoId, i));
        }

        return items;

    }

    async callReadOwnedList(repoId, limit, offset) {

        let currentCount = await this.callCountOwned(repoId);

        let items = [];

        this.validateLimitOffset(limit, offset, currentCount);


        //Calculate end index
        let endIndex = this.calculateEndIndex(limit, offset, currentCount);


        // console.log(`limit: ${limit}, offset: ${offset}, endIndex: ${endIndex}, count: ${currentCount}`);

        for (var i=offset; i <= endIndex; i++) {
            items.push(await this.callReadByOwnedIndex(repoId, i));
        }

        return items;

    }


    async callReadOwnedListDescending(repoId, limit, offset) {

        let currentCount = await this.callCountOwned(repoId);

        //Adjust the offset to start at the end of the list.
        let calculatedOffset = this.calculateDescendingOffset(offset, currentCount);


        let items = [];

        this.validateLimitOffset(limit, calculatedOffset, currentCount);


        //Calculate end index
        let endIndex = this.calculateDescendingEndIndex(limit, calculatedOffset);

        // console.log(`limit: ${limit}, offset: ${calculatedOffset}, endIndex: ${endIndex}, count: ${currentCount}`);


        for (var i=calculatedOffset; i >= endIndex; i--) {
            items.push(await this.callReadByOwnedIndex(repoId, i));
        }

        return items;

    }


    async callCount(repoId) {
        let result = await this.recordServiceContract.count.call(repoId);
        return result.toNumber();
    }

    async callCountOwned(repoId) {
        let result = await this.recordServiceContract.countOwned.call(repoId);
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
            repoId: resultArray[3].toNumber()
        }
    }

    validateLimitOffset(limit, offset, currentCount) {
        if (limit <= 0) {
            throw `Negative limit given. Limit needs to be positive: ${limit}`;
        }

        if (offset < 0) {
            throw `Negative offset provided. Offset needs to be positive: ${offset}`;
        }

        if (offset >= currentCount) {
            throw `Invalid offset provided. Offset must be lower than total number of records: offset: ${offset}, currrentCount: ${currentCount}`;
        }
    }


    calculateEndIndex(limit, offset, currentCount) {
        let endIndex = offset + limit - 1

        //If it's the last page don't go past the final record
        return Math.min( currentCount - 1,  endIndex )
    }


    calculateDescendingEndIndex(limit, offset) {
        let endIndex = offset - (limit - 1)

        //Don't go lower than 0
        return Math.max( 0,  endIndex )
    }

    calculateDescendingOffset(offset, currentCount) {

        let calculatedOffset = (currentCount - 1) - offset
        // console.log(`offset: ${offset}, currentCount: ${currentCount}, calculatedOffset: ${calculatedOffset}`)
        return Math.max( 0,  calculatedOffset )
    }

}



module.exports = RecordService;