var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

    locals.data = {
        featuredVideo: null,
        videos: []
    };

    view.on('init', function (next) {
        keystone
            .list('VimeoVideo')
            .model
            .find()
            .sort('sortOrder')
            .exec(function(err, videos) {
                if (err) {
                    return next(err);
                }
                if (videos && videos.length) {
                    var video = videos.shift();
                    locals.data.featuredVideoId = video.vimeoId;
                    locals.data.videos = JSON.stringify(videos);
                }
                
                next();
            });
    });

	// Render the view
	view.render('index');
};
