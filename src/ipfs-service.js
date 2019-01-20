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

        let cid

        try {
            cid = await this.ipfs.dag.put(data);
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

        if (!cid) {
            throw new IpfsException("No CID returned from IPFS")
        }


        return cid.toBaseEncodedString();

    }

    async ipfsGetJson(hash) {

        let node

        try {
            node = await this.ipfs.dag.get(hash);
            return node.value;
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

        if (!node) {
            throw new IpfsException("No node returned from IPFS")
        }

        return node.value;

    }


    async ipfsPutFile(file, options) {

        let results

        try {
            results = await this.ipfs.add(file, options)
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

        if (!results) {
            throw new IpfsException("No results returned from IPFS")
        }

        let cid = results[0].hash;
        return cid;

    }

    async ipfsGetFile(cid) {

        let results

        try {
            results = await this.ipfs.get(cid)
        } catch (ex) {
            throw this.ipfsExceptionTranslator(ex)
        }

        if (!results) {
            throw new IpfsException("No results returned from IPFS")
        }


        return results[0].content

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