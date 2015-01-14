var request = require('request'),
    mongoose = require('mongoose'),
    Busboy = require('busboy'),
    Storage = require('./storage');

var StorageModel = mongoose.model('storage');

var storage = new Storage(CONFIG.PATH);

function save(file, filename, mimetype, callback){
    if(typeof filename === 'function'){
        callback = filename;
        filename = undefined;
    }else if(typeof mimetype === 'function'){
        callback = mimetype;
        mimetype = undefined;
    }
    callback = callback || function(){};
    storage.stream(file, function(err, id){
        filename = filename || id;
        var storage = new StorageModel({
            name: filename,
            filename: filename,
            file: id,
            mimetype: mimetype || req.headers['content-type']
        });
        storage.save(function(err, storage){
            if(err) return callback(err);
            callback(null, storage);
        });
    });
}

module.exports = function(app){

    app.post('/u', function(req, res, next){

        var fn = function(err, data){
            if(err) return next(err);
            res.json(data);
        };

        var filename = req.body.name || req.query.filename;

        var url = req.param('url');
        if(url) return save(request(url), filename, fn);

        try{
            var busboy = new Busboy({headers: req.headers});
            busboy.on('file', function(fieldname, file, name, encoding, mimetype) {
                save(file, filename || name, mimetype, fn);
            });
            req.pipe(busboy);
        }catch(err){
            save(req, filename, req.query.mimetype, fn);
        }

    });

    app.get('/d', function(req, res){
        res.send('a');
    });
};
