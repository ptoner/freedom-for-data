
class DataAccessService {
    
    constructor(recordService, ipfsService, utils) {
        this.recordService = recordService;
        this.ipfsService = ipfsService;
        this.utils = utils;
    }

    async create(data) {

        //Put the data in IPFS
        const ipfsHash = await this.ipfsService.ipfsPut(data);

        if (!ipfsHash) {
            throw "Multihash not returned from IPFS";
        }
        
        //Get the hash and pass to sendCreate
        let result = await this.recordService.sendCreate(ipfsHash);

        
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


        //Get json data from IPFS
        let data = await this.ipfsService.ipfsGet(record.ipfsCid);

        //Merge
        Object.assign(record, data);
        
        return record;
        
    }
}



module.exports = DataAccessService;