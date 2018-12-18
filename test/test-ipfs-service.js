const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();


describe("IPFSService", async function() {

    let ipfsService;

    before('Setup', async () => {
        ipfsService = serviceFactory.getIpfsService();
    });
    

    it("Test ipfsPut: Save some data and then try to get it back out with IPFS directly and verify.", async function() {
      
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
  
  });


