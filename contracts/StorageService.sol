pragma solidity ^0.5.0;

contract StorageService {

    struct Item {
        uint256 id;
        address owner;
        string ipfsHash;
        uint256 index;
    }

    event ItemEvent (
        uint256 id,
        address owner,
        string ipfsHash,
        uint256 index,
        string eventType
    );



    mapping(uint256 => Item) private itemMapping;

    //An unordered index of the items that are active.
    uint256[] private itemIndex;

    //Don't want to reuse ids so just keep counting forever.
    uint256 private nextId;


    function create(string calldata _ipfsHash) external returns (uint256 id) {
        
        nextId++;

        Item memory item = Item({
            id : nextId,
            owner: msg.sender,
            ipfsHash : _ipfsHash,
            index: itemIndex.length
        });

        //Put item in mapping
        itemMapping[item.id] = item;


        //Put id in index
        itemIndex.push(item.id);


        emit ItemEvent(
            itemMapping[item.id].id,
            itemMapping[item.id].owner,
            itemMapping[item.id].ipfsHash,
            itemMapping[item.id].index,
            "NEW"
        );


        return itemMapping[id].id;
    }

    function read(uint256 _id) public view returns (address owner, string memory ipfsHash, uint256 index ) {

        Item storage item = itemMapping[_id];

        return (item.owner, item.ipfsHash, item.index);
    }

    function update(uint256 _id, string calldata _ipfsHash) external {

        if (keccak256(bytes(itemMapping[_id].ipfsHash)) != keccak256(bytes(_ipfsHash))) {
            itemMapping[_id].ipfsHash = _ipfsHash;

            emit ItemEvent(
                itemMapping[_id].id,
                itemMapping[_id].owner,
                itemMapping[_id].ipfsHash,
                itemMapping[_id].index,
                "UPDATE"
            );   
        }
    }


    //Paging functionality
    function count() external view returns (uint256 theCount) {
        return itemIndex.length;
    }

    function readByIndex(uint256 _index) external view returns (address owner, string memory ipfsHash, uint256 index) {
        
        require(_index < itemIndex.length, "No item at index");

        uint256 idAtIndex = itemIndex[_index];

        require(idAtIndex >= 0, "Invalid id at index");

        return read(idAtIndex);
    }






}


