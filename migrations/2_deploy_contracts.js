var StorageService = artifacts.require("StorageService");


module.exports = function(deployer) {
  deployer.deploy(StorageService);
};