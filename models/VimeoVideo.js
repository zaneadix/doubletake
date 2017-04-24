var keystone = require('keystone');
var Types = keystone.Field.Types;

var VimeoVideo = new keystone.List('VimeoVideo');

VimeoVideo.add({
    title: { type: String, required: true, initial: true, index: true },
    identifier: { type: String, initial: true, required: true, unique: true, index: true }
});


/**
 * Registration
 */
VimeoVideo.defaultColumns = 'title, id';
VimeoVideo.register();
