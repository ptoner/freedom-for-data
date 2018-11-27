var RecordService = artifacts.require("RecordService");


module.exports = function(deployer) {
  deployer.deploy(RecordService);
};