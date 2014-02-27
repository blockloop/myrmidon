(function(){
	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');
	var config = require('../config.json');
	var http = require('restler');
	var util = require('./utils');

	exports.getFeedsForUser = function(username,cb) {
		var feedUrl = 'http://gdata.youtube.com/feeds/base/users/'+ username +'/playlists?v=2&alt=json';

		var data = http.get(feedUrl).on('complete', function(data) {
			var author = data.feed.author[0].name.$t;

			var items = _.map(data.feed.entry, function(item){
				var title = item.title.$t;
				var url = _.find(item.link, {"rel":"alternate"}).href;
				var id = url.replace(util.getPlaylistUrl(""), '');
				return {
					title: item.title.$t,
					author: author,
					id: id
				};
			});

			cb(items);
		});
	};

	exports.addFeed = function(feed) {
		if (!config.feeds) {
			config.feeds = [];
		}

		if (_.any(config.feeds, {"id": feed.id})) {
			throw "Feed already exists";
		}

		config.feeds.push(feed);

		fs.writeFile('./config.json', JSON.stringify(config,null,2), function (err) {
			if (err) throw err;
			console.log(feed.title+ ' saved successfully!');
		});
	};

	exports.download = function() {

	};
})();