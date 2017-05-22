var keystone = require('keystone');
var Types = keystone.Field.Types;

var VimeoVideo = new keystone.List('VimeoVideo', {
    sortable: true
});

VimeoVideo.add({
    title: { type: String, required: true, initial: true, index: true },
    vimeoId: { type: String, initial: true, required: true, unique: true, index: true },
    sortOrder: { type: Number, index: true }
});


/**
 * Registration
 */
VimeoVideo.defaultColumns = 'title, vimeoId, sortOrder';
VimeoVideo.register();
