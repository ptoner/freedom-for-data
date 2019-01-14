const IpfsException = require('./exceptions/ipfs-exception.js');


class IPFSService {
    
    constructor(ipfs) {
        this.ipfs = ipfs;
    }


    /**
     * This function will take a JSON object and save it to IPFS. Returns the hash.
     * @param {Data to save to IPFS} data 
     */
    async ipfsPutJson(data) {

        try {
            const cid = await this.ipfs.dag.put(data);
            return cid.toBaseEncodedString();

        } catch (ex) {
            throw new IpfsException(ex.message)
        }

    }

    async ipfsGetJson(hash) {

        try {
            const node = await this.ipfs.dag.get(hash);
            return node.value;
        } catch (ex) {
            throw new IpfsException(ex.message)
        }

    }


    async ipfsPutFile(file, options) {

        try {
            let results = await this.ipfs.add(file, options);
            let cid = results[0].hash;
            return cid;
        } catch (ex) {
            throw new IpfsException(ex.message)
        }

    }

    async ipfsGetFile(cid) {

        try {
            let results = await this.ipfs.get(cid);
            return results[0].content;
        } catch (ex) {
            throw new IpfsException(ex.message)
        }

    }

    
}


module.exports = IPFSService;