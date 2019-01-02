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

    /*
     * Map between a hash of the repoId and owner address and the array that
     * holds the indexes for it.
     */
    mapping(bytes32 => uint256[]) private repoIdAddressHashToIndexesMapping;


    //Records are ultimately stored mapped by their id.
    mapping(uint256 => Record) private recordMapping;



    uint256 nextId;

    function create(uint _repoId, string calldata _ipfsCid) external returns (uint256 id) {
        
        // require(serviceOwner == msg.sender, "Permission denied");
        require(_repoId != 0, "You must supply a repo"); 
        require(bytes(_ipfsCid).length > 0, "You must supply an ipfsCid");

        nextId++;

        //Get the existing indexes for this repo
        uint256[] storage repoIndex = repoIdIndexesMapping[_repoId];

        //Get the existing indexes for this repo/owner
        bytes32 repoIdAddressHash = keccak256RepoIdAndOwner(_repoId, msg.sender);
        uint256[] storage repoOwnerIndex = repoIdAddressHashToIndexesMapping[repoIdAddressHash];

        Record memory record = Record({
            id : nextId,
            owner: msg.sender,
            ipfsCid : _ipfsCid,
            index: repoIndex.length,
            repoId: _repoId
        });

        //Put item in mapping
        recordMapping[record.id] = record;

        //Put id in indexes
        repoIndex.push(record.id);
        repoOwnerIndex.push(record.id);


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

        require(_repoId != 0, "You must supply a repo");
        require(_id != 0, "You must supply an id");

        Record storage record = recordMapping[_id];

        require(record.repoId == _repoId, "No record found");

        return (record.id, record.owner, record.ipfsCid, record.repoId, record.index);
    }

    function update(uint _repoId, uint256 _id, string calldata _ipfsCid) external {

        Record storage record = recordMapping[_id];

        require(record.owner == msg.sender, "You don't own this record");
        require(record.repoId == _repoId, "No record found"); 
        require(bytes(_ipfsCid).length > 0, "You must supply an ipfsCid"); 


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


    
    function count(uint _repoId) external view returns (uint256 theCount) {
        require(_repoId != 0, "You must supply a repo");

        uint256[] storage repoIndex = repoIdIndexesMapping[_repoId];
        return repoIndex.length;
    }

    function readByIndex(uint _repoId, uint256 _index) external view returns (uint256 id, address owner, string memory ipfsCid, uint repoId, uint256 index) {
        
        require(_repoId != 0, "You must supply a repo");
        uint256[] storage repoIndex = repoIdIndexesMapping[_repoId]; //unit test before adding a record

        require(_index < repoIndex.length, "No record at index"); //check if we're passed the end of the array

        uint256 idAtIndex = repoIndex[_index];

        require(idAtIndex >= 0, "Invalid id at index");

        return read(_repoId, idAtIndex);
    }





    function countOwner(uint _repoId) external view returns (uint256 theCount) {
        require(_repoId != 0, "You must supply a repo");

        bytes32 repoIdAddressHash = keccak256RepoIdAndOwner(_repoId, msg.sender);

        uint256[] storage repoIndex = repoIdAddressHashToIndexesMapping[repoIdAddressHash];
        return repoIndex.length;
    }

    function readByOwnerIndex(uint _repoId, uint256 _index) external view returns (uint256 id, address owner, string memory ipfsCid, uint repoId, uint256 index) {
        
        require(_repoId != 0, "You must supply a repo");
        
        bytes32 repoIdAddressHash = keccak256RepoIdAndOwner(_repoId, msg.sender);

        uint256[] storage repoOwnerIndex = repoIdAddressHashToIndexesMapping[repoIdAddressHash];

        require(_index < repoOwnerIndex.length, "No record at index"); //check if we're passed the end of the array

        uint256 idAtIndex = repoOwnerIndex[_index];
        require(idAtIndex >= 0, "Invalid id at index");

        return read(_repoId, idAtIndex);


    }



    function keccak256RepoIdAndOwner(uint _repoId, address owner) internal pure returns (bytes32) {
        return keccak256(abi.encode(owner, _repoId));
    }

}


