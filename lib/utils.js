var request = require('request'),
	fs = require('fs');

exports.downloadFile = function(uri, filename, callback){
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
};