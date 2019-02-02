const Utils = require('./utils.js');



class FreedomService {

    constructor(recordService, ipfsService) {

        //Passing in a js object that can talk to the RecordService contract
        this.recordService = recordService;

        //Passing in a js object that can talk to IPFS
        this.ipfsService = ipfsService;

        this.utils = new Utils();
    }

    async create(repoId, data, transactionObject) {

        //Put the data in IPFS
        const ipfsCid = await this.ipfsService.ipfsPutJson(data);

        if (!ipfsCid) {
            throw "CID not returned from IPFS";
        }

        //Get the hash and pass to sendCreate
        let record = await this.createWithIpfsCid(repoId, ipfsCid, transactionObject)

        delete data.id

        Object.assign(record, data);

        return record;

    }

    async createWithIpfsCid(repoId, ipfsCid, transactionObject) {

        //Get the hash and pass to sendCreate
        let result = await this.recordService.sendCreate(repoId, ipfsCid, transactionObject);


        //The event returns the metadata about our created data.
        var log = this.utils.getLogByEventName("RecordEvent", result.logs)

        const record = {
            id: log.args.id.toNumber(),
            eventType: log.args.eventType,
            repoId: log.args.repoId.toNumber(),
            ipfsCid: log.args.ipfsCid,
            owner: log.args.owner
        }

        return record;


    }

    async read(repoId, id) {

        //Get metadata from contract
        let record = await this.recordService.callRead(repoId, id);
        return this.fetchIpfs(record);
    }

    async readByOwnedIndex(repoId, owner, index) {
        let record = await this.recordService.callReadByOwnedIndex(repoId, owner, index)

        return this.fetchIpfs(record);
    }

    async readByIndex(repoId, index) {

        //Get metadata from contract
        let record = await this.recordService.callReadByIndex(repoId, index)

        return this.fetchIpfs(record);

    }

    async readList(repoId, limit, offset) {

        let merged = [];

        // console.log(`limit: ${limit}, offset: ${offset}`);

        let results = await this.recordService.callReadList(repoId, limit, offset)

        for (const result of results) {
            merged.push(await this.fetchIpfs(result));
        }

        return merged;
    }

    async readListDescending(repoId, limit, offset) {

        let merged = [];

        // console.log(`limit: ${limit}, offset: ${offset}`);

        let results = await this.recordService.callReadListDescending(repoId, limit, offset)

        for (const result of results) {
            merged.push(await this.fetchIpfs(result))
        }

        return merged;
    }

    async readOwnedList(repoId, owner, limit, offset) {

        let merged = [];

        // console.log(`limit: ${limit}, offset: ${offset}`);

        let results = await this.recordService.callReadOwnedList(repoId, owner, limit, offset)

        for (const result of results) {
            merged.push(await this.fetchIpfs(result))
        }

        return merged;
    }

    async readOwnedListDescending(repoId, owner, limit, offset) {

        let merged = [];

        // console.log(`limit: ${limit}, offset: ${offset}`);

        let results = await this.recordService.callReadOwnedListDescending(repoId, owner, limit, offset);

        for (const result of results) {
            merged.push(await this.fetchIpfs(result));
        }

        return merged;
    }

    async fetchIpfs(record) {

        //Get json data from IPFS
        let data = await this.ipfsService.ipfsGetJson(record.ipfsCid);

        if (record.id) delete data.id

        //Merge
        Object.assign(record, data);

        return record;
    }

    async update(repoId, id, data, transactionObject) {

        //Put the data in IPFS
        const ipfsCid = await this.ipfsService.ipfsPutJson(data);

        await this.recordService.sendUpdate(repoId, id, ipfsCid, transactionObject);

    }

    async count(repoId) {
        return this.recordService.callCount(repoId);
    }

    async countOwned(repoId, owner) {
        return this.recordService.callCountOwned(repoId, owner);
    }

    async ipfsPutFile(file, options) {
        return this.ipfsService.ipfsPutFile(file, options);
    }

    async ipfsGetFile(cid) {
        return this.ipfsService.ipfsGetFile(cid);
    }
}





module.exports = FreedomService;