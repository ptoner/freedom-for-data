class DataAccessService {
    
    constructor(recordService, ipfsService) {
        this.recordService = recordService;
        this.ipfsService = ipfsService;
    }

    async create(data) {

        //Put the data in IPFS
        const ipfsHash = await this.ipfsService.ipfsPut(data);

        if (!ipfsHash) {
            throw "Multihash not returned from IPFS";
        }
        
        //Get the hash and pass to sendCreate
        return this.recordService.sendCreate(ipfsHash)

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