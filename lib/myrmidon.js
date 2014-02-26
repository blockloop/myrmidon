(function(){
	var fs = require('fs'),
		path = require('path'),
		_ = require('lodash'),
		config = require('../config.json');

	exports.addFeed = function(username, opts) {
		var obj = opts||{};
		obj.username = username;

		if (!config.feeds) {
			config.feeds = [];
		}

		if (_.any(config.feeds, {"username": username})) {
			throw "Feed exists";
		}

		config.feeds.push(obj);
		console.log("CONFIG" + JSON.stringify(config,null,true));

		fs.writeFile('./config.json', JSON.stringify(config), function (err) {
			if (err) {
				throw err;
			}
			console.log('It\'s saved!');
		});
	};
})();