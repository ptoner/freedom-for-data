(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const ServiceFactory = require('./src/service-factory.js');


module.exports = function(recordServiceContract, ipfs) {

    const serviceFactory = new ServiceFactory(recordServiceContract, ipfs);

    return serviceFactory.getFreedomService();
};
},{"./src/service-factory.js":5}],2:[function(require,module,exports){
var Utils = require('./utils.js');


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
        const ipfsHash = await this.ipfsService.ipfsPut(data);

        if (!ipfsHash) {
            throw "Multihash not returned from IPFS";
        }
        
        //Get the hash and pass to sendCreate
        let result = await this.recordService.sendCreate(repoId, ipfsHash, transactionObject);

        
        //The event returns the metadata about our created data.
        var log = this.utils.getLogByEventName("RecordEvent", result.logs);
        
        const record = {
            id: log.args.id.toNumber(),
            eventType: log.args.eventType,
            repoId: log.args.repoId.toNumber(),
            index: log.args.index.toNumber(),
            ipfsCid:log.args.ipfsCid,
            owner: log.args.owner
        }

        Object.assign(record, data);

        return record;

    }


    async read(repoId, id) {

        //Get metadata from contract
        let record = await this.recordService.callRead(repoId, id);
        return this.fetchIpfs(record);
    }

    async readByIndex(repoId, index) {

        //Get metadata from contract
        let record = await this.recordService.callReadByIndex(repoId, index);

        return this.fetchIpfs(record);

    }

    async readList(repoId, limit, offset) {

        let merged = [];

        // console.log(`limit: ${limit}, offset: ${offset}`);

        let results = await this.recordService.callReadList(repoId, limit, offset);

        for (const result of results) {
            merged.push(await this.fetchIpfs(result));
        }

        return merged;
    }

    async fetchIpfs(record) {

        //Get json data from IPFS
        let data = await this.ipfsService.ipfsGet(record.ipfsCid);

        //Merge
        Object.assign(record, data);
        
        return record;
    }


    async update(repoId, id, data, transactionObject) {

        //Put the data in IPFS
        const ipfsCid = await this.ipfsService.ipfsPut(data);

        await this.recordService.sendUpdate(repoId, id, ipfsCid, transactionObject);

    }


    async count(repoId) {
        return this.recordService.callCount(repoId);
    }
}



module.exports = FreedomService;
},{"./utils.js":6}],3:[function(require,module,exports){

class IPFSService {
    
    constructor(ipfs) {
        this.ipfs = ipfs;
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
},{}],4:[function(require,module,exports){
class RecordService {

    constructor(recordServiceContract) {
        this.recordServiceContract = recordServiceContract;
    }

    /**
     * CALLS
     */
    async callRead(repoId, id) {
        let resultArray = await this.recordServiceContract.read.call(repoId, id);
        return this.recordMapper(resultArray);
    }

    async callReadByIndex(repoId, index) {
        let resultArray = await this.recordServiceContract.readByIndex.call(repoId, index);
        return this.recordMapper(resultArray);
    }

    async callReadList(repoId, limit, offset) {

        let currentCount = await this.callCount(repoId);

        let items = [];

        if (limit <= 0) {
            throw "Invalid limit provided";
        }

        if (offset < 0 || offset >= currentCount) {
            throw "Invalid offset provided";
        }

        //Calculate end index
        let endIndex; 
        if (offset > 0) {
            endIndex = offset + limit -1;
        } else {
            endIndex = limit - 1; 
        }

        //If it's the last page don't go past the final record
        endIndex = Math.min( currentCount - 1,  endIndex );

        // console.log(`limit: ${limit}, offset: ${offset}, endIndex: ${endIndex}, count: ${currentCount}`);

        for (var i=offset; i <= endIndex; i++) {
            items.push(await this.callReadByIndex(repoId, i));
        }

        return items;

    }

    async callCount(repoId) {
        let result = await this.recordServiceContract.count.call(repoId);
        return result.toNumber();
    }


    /**
     * SEND
     */
    async sendCreate(repoId, ipfsCid, transactionObject) {      
        if (transactionObject) {
            return this.recordServiceContract.create(repoId, ipfsCid, transactionObject);
        }
        
        return this.recordServiceContract.create(repoId, ipfsCid);

    }

    async sendUpdate(repoId, id, ipfsCid, transactionObject) {      
        
        if (transactionObject) {
            return this.recordServiceContract.update(repoId, id, ipfsCid, transactionObject);
        }

        return this.recordServiceContract.update(repoId, id, ipfsCid);
        
    }


    /**
     * UTIL
     */
    async recordMapper(resultArray) {
        
        return {
            id: resultArray[0].toNumber(),
            owner: resultArray[1],
            ipfsCid: resultArray[2],
            repoId: resultArray[3].toNumber(),
            index: resultArray[4].toNumber()
        }
    }



}

RecordService.prototype = {
    constructor: RecordService,

    
}

module.exports = RecordService;
},{}],5:[function(require,module,exports){
const RecordService = require('./record-service.js');
const FreedomService = require('./freedom-service.js');
const IPFSService = require('./ipfs-service.js');



class ServiceFactory {

    constructor(recordServiceContract, ipfs) {
        this.recordServiceContract = recordServiceContract;
        this.ipfs = ipfs;

        this.initialize(recordServiceContract, ipfs);

    }

    initialize(recordServiceContract, ipfs) {
        this.recordService = new RecordService(recordServiceContract);
        this.ipfsService = new IPFSService(ipfs);
        this.freedomService = new FreedomService(this.recordService, this.ipfsService);
    }

    /**
     * Only giving getters to the actual services to expose
     */

    getRecordService() {
        return this.recordService;
    }

    getIpfsService() {
        return this.ipfsService;
    }

    getFreedomService() {
        return this.freedomService;
    }

}



module.exports = ServiceFactory;
},{"./freedom-service.js":2,"./ipfs-service.js":3,"./record-service.js":4}],6:[function(require,module,exports){
class Utils {
    constructor() {

    }

    getLogByEventName(eventName, logs) {

        if (!logs) return;

        var found;

        logs.forEach(function(log){

            if (log.event == eventName) {
                found = log;
            }
        });

        return found;
    }


    logArgsToRecord(args) {
        return {
            id: args.id.toNumber(),
            eventType: "NEW",
            index: args.index.toNumber(),
            ipfsCid: args.ipfsCid,
            owner: args.owner
        }

    }


    recordEventToRecord(result) {
        var log = this.getLogByEventName("RecordEvent", result.logs);
        return this.logArgsToRecord(log.args);
    }

}

module.exports = Utils;
},{}]},{},[1]);
