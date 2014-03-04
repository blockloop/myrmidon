(function(){
	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');
	var config = require('../config.json');
	var http = require('restler');
	var util = require('./utils');
	var mkdirp = require('mkdirp');
	var glob = require('glob');
	var now = require('moment');

	exports.getFeedsForUser = function(username,cb) {
		var feedUrl = 'http://gdata.youtube.com/feeds/base/users/'+ username +'/playlists?v=2&alt=json';

		var data = http.get(feedUrl)
			.on('fail', function(err){
				var msg = 'Could not find any playlists for this user' + ' ('+ err.errors.error[0].internalReason[0] + ')';
				console.error(msg.red);
				process.exit(1);
			})
			.on('success', function(data) {
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
		if (!config.feeds) config.feeds = [];

		if (_.any(config.feeds, {"id": feed.id})) {
			console.error("Already subscribed to that feed".red);
			process.exit(1);
		}

		config.feeds.push(feed);

		fs.writeFile('./config.json', JSON.stringify(config,null,2), function (err) {
			if (err) throw err;
			var msg = feed.title+ ' saved successfully!';
			console.log(msg.green);
		});
	};

	exports.downloadItem = function(info, opts) { // title, author, id
		var youtubedl = require('youtube-dl');
		var downloadDir = path.normalize(config.user.mediaDir||process.cwd());
		downloadDir = path.join(downloadDir, 'myrmidon', info.author);

		if (!fs.existsSync(downloadDir)) {
			mkdirp.sync(downloadDir);
		}

		var videoUrl = util.getVideoUrl(info.id);

		if (glob.sync(downloadDir + '/**/' + info.id + '.*').length) {
			console.log('Already downloaded ' + info.title);
			console.log('  Use the --force-redownload flag to override');
			return;
		}

		var args = ['--add-metadata', '--id'];
		var isAudioOnly = _.where(config.user.audioAuthors, function(item) {
			return item.toLowerCase() === info.author.toLowerCase();
		}).length;

		if (isAudioOnly) {
			console.log('Marking for audio only: ' + info.id + ', ' + info.title);
			args.push('--extract-audio');
			args.push('--audio-format=mp3');
		}

		var dl = youtubedl.download(videoUrl, downloadDir, config.youtubeDlArgs.concat(args));

		// will be called when the download starts
		dl.on('download', function(data) {
			console.log('Downloading ' + data.filename + ' (' + data.size + ')');
		});

		// since the downloads are run in parallell this will be ugly
		// dl.on('progress', function(data) {
		// process.stdout.write(data.eta + ' ' + data.percent + '% at ' + data.speed + '\r');
		// });

		// catches any errors
		dl.on('error', function(err) {
			console.error('ERROR: Cannot download'.red);
			throw err;
		});

		// called when youtube-dl finishes
		dl.on('end', function(data) {
			console.log('Done. ' + data.filename);
			// console.log('Filename:', data.filename);
			// console.log('Size:', data.size);
			// console.log('Time Taken:', data.timeTaken);
			// console.log('Time Taken in ms:', + data.timeTakenms);
			// console.log('Average Speed:', data.averageSpeed);
			// console.log('Average Speed in Bytes:', data.averageSpeedBytes);
		});
	};



	exports.downloadNewSubscriptions = function(user, opts) {
		var url = 'https://gdata.youtube.com/feeds/base/users/'+ user +'/newsubscriptionvideos?v=2&alt=json';

		var data = http.get(url)
			.on('fail', function(err){
				var error = err.errors.error[0];
				var reason = error.internalReason[0];
				var code = error.code[0];
				var msg = ('Could not access this user' + ' ('+ code +')');
				if (code === 'ServiceForbiddenException') {
					msg += "\n  This requires temporarily disabling \"Keep all my subscriptions private.\"";
					msg += "\n  Go to http://www.youtube.com/account_privacy";
					//
				}
				if (code === 'ResourceNotFoundException') {
					msg += "\n  Please use your User ID from http://www.youtube.com/account_advanced";
				}
				throw new Error(msg.red);
			})
			.on('success', function(data) {
				_.each(data.feed.entry, function(item){
					var author = item.author[0].name.$t;
					var title = item.title.$t;
					var published = now(item.published.$t);
					var url = _.find(item.link, {"rel":"alternate"}).href;
					var id = url.replace(util.getVideoUrl(''), '');
					id = id.split('?')[0].split('&')[0];

					if (published >= opts.limit) {
						console.log();
						console.log('Downloading ' + title + ' (' + published.format('MMM DD') + ')');
						exports.downloadItem({
							title: item.title.$t,
							author: author,
							id: id
						}, opts);
					}
				});
			});
	};

})();