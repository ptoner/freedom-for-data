pragma solidity ^0.5.0;

/**
 * Note: 
 * I'm naming this RecordService because I think naming these things "Contract" is an artifact 
 * that will quickly disappear once more and more apps start to appear. Naming this "RecordContract"
 * would be like naming all of your Java classes "StudentClass" and "DatabaseClass". 
 * 
 * We know it's a contract because of the contract keyword. 
 */
contract RecordService {

    address serviceOwner;

    struct Record {
        uint256 id;
        address owner;
        string ipfsCid;
        uint repoId;
        uint256 index;
    }

    event RecordEvent (
        uint256 id,
        address owner,
        string ipfsCid,
        uint repoId,
        uint256 index,
        string eventType
    );


    constructor() public {
        serviceOwner = msg.sender;
    }

    //
    /**
     * Map between repoId and the array that holds the indexes for it.
     * 
     * The uint is the repoId and the uint256[] is an array cointaining
     * the ids of records held in that repo. The ids in each index are 
     * ordered by when they were created.
     */
    mapping(uint => uint256[]) private repoIdIndexesMapping;

    //Records are ultimately stored mapped by their id.
    mapping(uint256 => Record) private recordMapping;

    uint256 nextId;

    function create(uint _repoId, string calldata _ipfsCid) external returns (uint256 id) {
        
        require(serviceOwner == msg.sender, "Permission denied");//need unit test
        require(_repoId != 0, "You must supply a repo."); //need unit test
        require(bytes(_ipfsCid).length > 0, "You must supply an ipfsCid");//need unit test

        nextId++;

        //Get the existing indexes for this repo
        uint256[] storage repoIndex = repoIdIndexesMapping[_repoId];

        Record memory record = Record({
            id : nextId,
            owner: msg.sender,
            ipfsCid : _ipfsCid,
            index: repoIndex.length,
            repoId: _repoId
        });

        //Put item in mapping
        recordMapping[record.id] = record;


        //Put id in index
        repoIndex.push(record.id);


        emit RecordEvent(
            recordMapping[record.id].id,
            recordMapping[record.id].owner,
            recordMapping[record.id].ipfsCid,
            recordMapping[record.id].repoId,
            recordMapping[record.id].index,
            "NEW"
        );


        return recordMapping[id].id;
    }

    function read(uint _repoId, uint256 _id) public view returns (uint256 id, address owner, string memory ipfsCid, uint repoId, uint256 index ) {

        require(_repoId != 0, "You must supply a repo"); //need unit test
        require(_id != 0, "You must supply an id");//need unit test

        Record storage record = recordMapping[_id];

        require(record.repoId == _repoId, "No record found"); //Need unit test

        return (record.id, record.owner, record.ipfsCid, record.repoId, record.index);
    }

    function update(uint _repoId, uint256 _id, string calldata _ipfsCid) external {

        Record storage record = recordMapping[_id];

        require(record.owner == msg.sender, "You don't own this record");
        require(record.repoId == _repoId, "No record found"); //Need unit test
        require(bytes(_ipfsCid).length > 0, "You must supply an ipfsCid"); //need unit test


        if (keccak256(bytes(record.ipfsCid)) != keccak256(bytes(_ipfsCid))) {
            record.ipfsCid = _ipfsCid;

            emit RecordEvent(
                record.id,
                record.owner,
                record.ipfsCid,
                record.repoId,
                record.index,
                "UPDATE"
            );   
        }
    }


    //Paging functionality
    function count(uint _repoId) external view returns (uint256 theCount) {
        require(_repoId != 0, "You must supply a repo"); //need unit test

        uint256[] storage repoIndex = repoIdIndexesMapping[_repoId]; //unit test before adding a record
        return repoIndex.length;
    }

    function readByIndex(uint _repoId, uint256 _index) external view returns (uint256 id, address owner, string memory ipfsCid, uint repoId, uint256 index) {
        
        require(_repoId != 0, "You must supply a repo"); //need unit test
        uint256[] storage repoIndex = repoIdIndexesMapping[_repoId]; //unit test before adding a record

        require(_index < repoIndex.length, "No record at index");

        uint256 idAtIndex = repoIndex[_index];

        require(idAtIndex >= 0, "Invalid id at index");

        return read(_repoId, idAtIndex);
    }

}


