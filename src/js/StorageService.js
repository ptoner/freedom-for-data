function StorageService(storageServiceContract, ipfs, multihash) {
    this.storageServiceContract = storageServiceContract;
    this.ipfs = ipfs;
    this.multihash = multihash;
}

StorageService.prototype = {
    constructor: StorageService,

    /**
     * Controller
    */
    create: async function(data) {

        var self = this;

        //Put the data in IPFS
        const ipfsHash = await self.ipfsPut(data);

        if (!ipfsHash) {
            throw "Multihash not returned from IPFS";
        }
        
        //Get the hash and pass to sendCreate
        return self.sendCreate(ipfsHash)

    },


    read: async function(id) {
        var self = this;

        //Get metadata from contract
        let record = await self.callRead(id);

        console.log(record);

        //Get json data from IPFS
        let data = await self.ipfsGet(record.ipfsCid);

        //Merge
        Object.assign(record, data);
        
        return record;
        
    },






    /**
     * CALLS
     */
    callRead: async function(id) {

        var self = this;

        let resultArray = await self.storageServiceContract.read.call(id);
        return self.recordMapper(id, resultArray);
    },




    /**
     * SEND
     */
    sendCreate: async function(ipfsHash) {
        return this.storageServiceContract.create(ipfsHash);
    },


    /**
     * UTIL
     */
    recordMapper: function(id, resultArray) {
        
        return {
            id: id.toNumber(),
            owner: resultArray[0],
            ipfsCid: resultArray[1],
            index: resultArray[2].toNumber()
        }
    },

    /**
     * This function will take a JSON object and save it to IPFS. Returns the hash.
     * @param {Data to save to IPFS} data 
     */
    ipfsPut: async function(data) {

        var self = this;

        const cid = await self.ipfs.dag.put(data);

        
        return cid.toBaseEncodedString();
    },

    ipfsGet: async function(hash) {
        var self = this;

        const node = await self.ipfs.dag.get(hash);

        return node.value;

    }

}

module.exports = StorageService;