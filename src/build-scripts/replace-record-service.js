const fs = require('fs');
const data = require('../../build/contracts/RecordService.json');

/*
* Replace the generated hash with placeholders
*/

data.networks["5777"].address = "<REPLACE ADDRESS>";
data.networks["5777"].transactionHash = "<REPLACE HASH>";

const newContent = JSON.stringify(data);


const stream = fs.createWriteStream('build/contracts/RecordService.json');
stream.once('open', function(fd) {
  stream.write(newContent);
  stream.end();
});

