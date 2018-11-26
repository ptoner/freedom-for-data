function StorageService(storageServiceContract, ipfs) {
    this.storageServiceContract = storageServiceContract;
    this.ipfs = ipfs;
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


        let item = await self.callRead(id);


        let data = await self.ipfsGet(item.ipfsHash);

        console.log(data);

        return data;
        
    },






    /**
     * CALLS
     */
    callRead: async function(id) {

        var self = this;

        let resultArray = await self.storageServiceContract.read.call(id);
        return self.itemMapper(id, resultArray);
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
    itemMapper: function(id, resultArray) {
        // console.log(resultArray);
        return {
            id: id,
            owner: resultArray[0],
            ipfsHash: resultArray[1],
            index: resultArray[2]
        }
    },

    /**
     * This function will take a JSON object and save it to IPFS. Returns the hash.
     * @param {Data to save to IPFS} data 
     */
    ipfsPut: async function(data) {

        var self = this;

        obj = {
            Data: JSON.stringify(data),
            Links: []
        }

        const node = await self.ipfs.object.put(obj);
        const nodeJSON = node.toJSON()

        const multihash = nodeJSON.multihash;
        return multihash;
    },

    ipfsGet: async function(hash) {
        var self = this;

        const node = await self.ipfs.object.get(hash);

        console.log(node);

        return node.data;

    }

}

module.exports = StorageService;