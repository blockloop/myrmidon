var request = require('request');
var fs = require('fs');

exports.downloadFile = function(uri, filename, callback){
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
};

exports.getPlaylistUrl = function(id) {
	return 'http://www.youtube.com/playlist?list=' + id;
};

exports.getVideoUrl = function(id) {
	return 'http://www.youtube.com/watch?v=' + id;
};
