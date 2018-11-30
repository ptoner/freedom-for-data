const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();


describe("IPFSService", async function() {

    // before('Setup', async () => {
    //     serviceFactory.initializeIpfsService();
    // });

    it("Test ipfsPut: Save some data and then try to get it back out with IPFS directly and verify.", async function() {
      
        //Arrange
        let createdRecord = {
            firstName: "Joe",
            lastName: "Musgrove"
        }

        //Act 
        const cid = await serviceFactory.getIpfsService().ipfsPut(createdRecord);


        //Assert
        const result = await serviceFactory.getIpfsService().ipfsGet(cid);

        assert.equal(result.firstName, "Joe");
        assert.equal(result.lastName, "Musgrove");

        
    });
  
  });


