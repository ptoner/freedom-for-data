const TestServiceFactory = require('./test-service-factory.js');
const serviceFactory = new TestServiceFactory();



const fs = require('fs');

const ipfsClient = require('ipfs-http-client')
const IPFSService = require('../src/ipfs-service.js');
const IpfsException = require('../src/exceptions/ipfs-exception.js');
const IpfsConnectionException = require('../src/exceptions/ipfs-connection-exception.js');


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
            assert.isTrue(ex instanceof IpfsException, "Should have thrown an error");
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

    it("Test ipfsPutJson: Invalid IPFS hostname", async function() {

       //Arrange
       const badIpfsService = createBadIpfsService("asfads", 5001)


       try {

           //Act
           await badIpfsService.ipfsPutJson({
               name: 'good data'
           })

           assert.fail("Should have thrown IpfsConnectionException")

       } catch (ex) {

           //Assert
           assert.isTrue(ex instanceof IpfsConnectionException, "Threw wrong exception type. Should be IpfsConnectionException");

       }

   })

    it("Test ipfsPutJson: Valid IPFS hostname. Invalid port", async function() {

        //Arrange
        const badIpfsService = createBadIpfsService("localhost", 6)


        try {

            //Act
            await badIpfsService.ipfsPutJson({
                name: 'good data'
            })

            assert.fail("Should have thrown IpfsConnectionException")

        } catch (ex) {

            //Assert
            assert.isTrue(ex instanceof IpfsConnectionException, "Threw wrong exception type. Should be IpfsConnectionException");

        }

    })

    it("Test ipfsGetJson: Invalid IPFS hostname", async function() {

        //Arrange

        const badIpfsService = createBadIpfsService("asfads", 5001)


        try {

            //Act
            await badIpfsService.ipfsGetJson("doesn't matter")

            assert.fail("Should have thrown IpfsConnectionException")

        } catch (ex) {

            //Assert
            assert.isTrue(ex instanceof IpfsConnectionException, "Threw wrong exception type. Should be IpfsConnectionException");

        }

    })

    it("Test ipfsGetJson: Valid IPFS hostname. Invalid port", async function() {

        //Arrange
        const badIpfsService = createBadIpfsService("localhost", 6)

        try {

            //Act
            await badIpfsService.ipfsGetJson("doesn't matter")


            assert.fail("Should have thrown IpfsConnectionException")

        } catch (ex) {

            //Assert
            assert.isTrue(ex instanceof IpfsConnectionException, "Threw wrong exception type. Should be IpfsConnectionException");

        }

    })


    function createBadIpfsService(host, port) {

        const badIpfs = ipfsClient({
            host: host,
            port: port
        });

        return new IPFSService(badIpfs)


    }



  });


