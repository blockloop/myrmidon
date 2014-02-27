var request = require('request');
var fs = require('fs');
var path = require('path');

exports.downloadFile = function(uri, filename, callback){
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
};

exports.getPlaylistUrl = function(id) {
	return 'https://www.youtube.com/playlist?list=' + id;
};

exports.getVideoUrl = function(id) {
	return 'https://www.youtube.com/watch?v=' + id;
};

exports.pathToResource = function(path) {
	var result = path.join(process.cwd(), path);
	return path.normalize(result);
};