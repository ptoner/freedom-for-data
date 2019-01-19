const IpfsException = require('./exceptions/ipfs-exception.js');
const IpfsConnectionException = require('./exceptions/ipfs-connection-exception.js');



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
            throw this.ipfsExceptionTranslator(ex)
        }

    }

    async ipfsGetJson(hash) {

        try {
            const node = await this.ipfs.dag.get(hash);
            return node.value;
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

    }


    async ipfsPutFile(file, options) {

        try {
            let results = await this.ipfs.add(file, options);
            let cid = results[0].hash;
            return cid;
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

    }

    async ipfsGetFile(cid) {

        try {
            let results = await this.ipfs.get(cid);
            return results[0].content;
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

    }


    /**
     * Translates the passed exception into the proper IpfsException sub-class.
     * If it can't find a specific one, it'll return an IpfsException.
     *
     * Note: remember to actually throw the exception after calling this. This just
     * returns the right one to throw.
     *
     * @param ex
     * @returns {*}
     */
    ipfsExceptionTranslator(ex) {
        if (ex.code == "ECONNREFUSED" || ex.code == "ENOTFOUND") {
            return new IpfsConnectionException(ex)
        } else {
            return new IpfsException(ex)
        }
    }
    
}


module.exports = IPFSService;