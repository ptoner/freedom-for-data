class IPFSService {
    
    constructor(ipfs, multihash) {
        this.ipfs = ipfs;
        this.multihash = multihash;
    }


    /**
     * This function will take a JSON object and save it to IPFS. Returns the hash.
     * @param {Data to save to IPFS} data 
     */
    async ipfsPut(data) {

        var self = this;

        const cid = await self.ipfs.dag.put(data);

        
        return cid.toBaseEncodedString();
    }

    async ipfsGet(hash) {
        var self = this;

        const node = await self.ipfs.dag.get(hash);

        return node.value;

    }
}


module.exports = IPFSService;