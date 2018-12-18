
class IPFSService {
    
    constructor(ipfs) {
        this.ipfs = ipfs;
    }


    /**
     * This function will take a JSON object and save it to IPFS. Returns the hash.
     * @param {Data to save to IPFS} data 
     */
    async ipfsPutJson(data) {

        const cid = await this.ipfs.dag.put(data);

        return cid.toBaseEncodedString();
    }

    async ipfsGetJson(hash) {

        const node = await this.ipfs.dag.get(hash);

        return node.value;

    }


    async ipfsPutFile(file, options) {
        let results = await this.ipfs.add(file, options);
        let cid = results[0].hash;
        return cid;

    }

    async ipfsGetFile(cid) {
        let results = await this.ipfs.get(cid);
        return results[0].content;
    }

    
}


module.exports = IPFSService;