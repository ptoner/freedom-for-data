var Utils = require('./utils.js');


class FreedomService {
    
    constructor(recordService, ipfsService) {

        //Passing in a js object that can talk to the RecordService contract
        this.recordService = recordService; 

        //Passing in a js object that can talk to IPFS
        this.ipfsService = ipfsService;
        this.utils = new Utils();
    }

    async create(data, transactionObject) {

        //Put the data in IPFS
        const ipfsHash = await this.ipfsService.ipfsPut(data);

        if (!ipfsHash) {
            throw "Multihash not returned from IPFS";
        }
        
        //Get the hash and pass to sendCreate
        let result = await this.recordService.sendCreate(ipfsHash, transactionObject);

        
        //The event returns the metadata about our created data.
        var log = this.utils.getLogByEventName("RecordEvent", result.logs);
        
        const record = {
            id: log.args.id.toNumber(),
            eventType: log.args.eventType,
            index: log.args.index.toNumber(),
            ipfsCid:log.args.ipfsCid,
            owner: log.args.owner
        }

        Object.assign(record, data);

        return record;

    }


    async read(id) {

        //Get metadata from contract
        let record = await this.recordService.callRead(id);

        return this.fetchIpfs(record);;
       
    }

    async readByIndex(index) {

        //Get metadata from contract
        let record = await this.recordService.callReadByIndex(index);

        return this.fetchIpfs(record);

    }

    async readList(limit, offset) {

        let merged = [];

        // console.log(`limit: ${limit}, offset: ${offset}`);

        let results = await this.recordService.callReadList(limit, offset);

        for (const result of results) {
            merged.push(await this.fetchIpfs(result));
        }

        return merged;
    }

    async fetchIpfs(record) {

        //Get json data from IPFS
        let data = await this.ipfsService.ipfsGet(record.ipfsCid);

        //Merge
        Object.assign(record, data);
        
        return record;
    }


    async update(id, data, transactionObject) {

        //Put the data in IPFS
        const ipfsCid = await this.ipfsService.ipfsPut(data);

        await this.recordService.sendUpdate(id, ipfsCid, transactionObject);

    }


    async count() {
        return this.recordService.callCount();
    }
}



module.exports = FreedomService;