var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');

exports.enquiry = function (req, res) {

	// var view = new keystone.View(req, res);
	// var locals = res.locals;

	// On POST requests, add the Enquiry item to the database
	// view.on('post', function (next) {
		var newEnquiry = new Enquiry.model(req.body);
		var updater = newEnquiry.getUpdateHandler(req);
		newEnquiry.save(function (error) {
			if (error) {
				console.log('error');
				return res.apiError(error);
			}
			// res.set('Content-Type', 'application/json')
			return res.apiResponse();
		});
	// });

	// view.render('contact');
};
