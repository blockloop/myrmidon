var request = require('request'),
	fs = require('fs'),
	path = require('path');

var logLevels = {
	"log": 0,
	"warning": 1,
	"error": 2
};

exports.downloadFile = function(uri, filename, callback){
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
};

exports.getPlaylistUrl = function(id) {
	return 'http://www.youtube.com/playlist?list=' + id;
};

exports.getVideoUrl = function(id) {
	return 'http://www.youtube.com/watch?v=' + id;
};

exports.pathToResource = function(path) {
	var result = path.join(process.cwd(), path);
	return path.normalize(result);
};

