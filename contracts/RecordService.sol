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

    struct Record {
        uint256 id;
        address owner;
        string ipfsCid;
        uint256 index;
    }

    event RecordEvent (
        uint256 id,
        address owner,
        string ipfsCid,
        uint256 index,
        string eventType
    );



    mapping(uint256 => Record) private recordMapping;

    //An unordered index of the items that are active.
    uint256[] private recordIndex;

    //Don't want to reuse ids so just keep counting forever.
    uint256 private nextId;


    function create(string calldata _ipfsCid) external returns (uint256 id) {
        
        nextId++;

        Record memory record = Record({
            id : nextId,
            owner: msg.sender,
            ipfsCid : _ipfsCid,
            index: recordIndex.length
        });

        //Put item in mapping
        recordMapping[record.id] = record;


        //Put id in index
        recordIndex.push(record.id);


        emit RecordEvent(
            recordMapping[record.id].id,
            recordMapping[record.id].owner,
            recordMapping[record.id].ipfsCid,
            recordMapping[record.id].index,
            "NEW"
        );


        return recordMapping[id].id;
    }

    function read(uint256 _id) public view returns (uint256 id, address owner, string memory ipfsCid, uint256 index ) {

        Record storage record = recordMapping[_id];

        return (record.id, record.owner, record.ipfsCid, record.index);
    }

    function update(uint256 _id, string calldata _ipfsCid) external {

        Record storage record = recordMapping[_id];

        require(record.owner == msg.sender, "You don't own this record");

        if (keccak256(bytes(record.ipfsCid)) != keccak256(bytes(_ipfsCid))) {
            record.ipfsCid = _ipfsCid;

            emit RecordEvent(
                record.id,
                record.owner,
                record.ipfsCid,
                record.index,
                "UPDATE"
            );   
        }
    }


    //Paging functionality
    function count() external view returns (uint256 theCount) {
        return recordIndex.length;
    }

    function readByIndex(uint256 _index) external view returns (uint256 id, address owner, string memory ipfsCid, uint256 index) {
        
        require(_index < recordIndex.length, "No record at index");

        uint256 idAtIndex = recordIndex[_index];

        require(idAtIndex >= 0, "Invalid id at index");

        return read(idAtIndex);
    }

}


