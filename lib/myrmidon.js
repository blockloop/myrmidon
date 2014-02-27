(function(){
	var fs = require('fs'),
		path = require('path'),
		_ = require('lodash'),
		config = require('../config.json'),
		http = require('restler');

	exports.getFeedsForUser = function(username,cb) {
		//
		var videoURL= 'http://www.youtube.com/watch?v=';
		var feedUrl = 'http://gdata.youtube.com/feeds/base/users/'+ username +'/playlists?v=2&alt=json';
		var data = http.get(feedUrl).on('complete', function(data){
			var items = _.map(data.feed.entry, function(item){
				var title = item.title.$t;
				var url = _.find(item.link, {"rel":"alternate"}).href;
				var id = url.replace('http://www.youtube.com/playlist?list=','');
				return {
					title: item.title.$t,
					url: url,
					id: id
				};
			});

			cb(items);
		});
	};

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

		fs.writeFile('./config.json', JSON.stringify(config,null,2), function (err) {
			if (err) throw err;
			console.log('It\'s saved!');
		});
	};

	exports.download = function() {

	};
})();