var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(CONFIG.DATABASE);

var Storage = new Schema({

    name:       {type: String},
    filename:   {type: String, index: true},
    file:       {type: String, required: true, index: true},
    mimetype:   {type: String, default: 'text/plain'},

    createTime: {type: Date, default: Date.now()},
    updateTime: {type: Date, default: Date.now()}
});

mongoose.model('storage', Storage, 'storage');