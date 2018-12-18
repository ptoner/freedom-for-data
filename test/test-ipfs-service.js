const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();

const fs = require('fs');

describe("IPFSService", async function() {

    let ipfsService;

    before('Setup', async () => {
        ipfsService = serviceFactory.getIpfsService();
    });
    

    it("Test ipfsPutJson & ipfsGetJson: Save some json data and then try to get it back out with IPFS directly and verify.", async function() {
      
        //Arrange
        let createdRecord = {
            firstName: "Joe",
            lastName: "Musgrove"
        }

        //Act 
        const cid = await ipfsService.ipfsPutJson(createdRecord);


        //Assert
        const result = await ipfsService.ipfsGetJson(cid);

        assert.equal(result.firstName, "Joe");
        assert.equal(result.lastName, "Musgrove");

        
    });


    it("Test ipfsGetJson: Get invalid ipfs cid", async function() {
      
        //Act
        try {
            const result = await ipfsService.ipfsGetJson("xyz");
        } catch (ex) {

            //Assert
            assert.equal(ex.message, "invalid 'ipfs ref' path");
        }
        
    });
  

    it("Test ipfsPutFile & ipfsGetFile: Save an image then try to get it back out with IPFS directly and verify.", async function() {
      
        //Arrange
        const buffer = fs.readFileSync('test/binary/test-image.jpeg');


        //Act 
        const cid = await ipfsService.ipfsPutFile(buffer);


        //Assert
        const result = await ipfsService.ipfsGetFile(cid);

        assert.isTrue(buffer.equals(result));
        
    });
    
  });


