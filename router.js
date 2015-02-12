var request = require('request'),
    mongoose = require('mongoose'),
    Busboy = require('busboy'),
    mimetype = require('mimetype'),
    async = require('onetool').async,
    Storage = require('./storage');

var StorageModel = mongoose.model('storage'),
    PictureModel = mongoose.model('picture');

var storage = new Storage(CONFIG.PATH);

function save(req, res, file, filename, mimetype, callback){

    async.waterfall([function(next){

        storage.stream(file, next);

    }, function(id, next){

        filename = filename || id;
        var storage = new StorageModel({
            name: filename,
            filename: filename,
            file: id,
            mimetype: mimetype
        });
        if(req.user){
            storage.author = req.user._id;
        }
        storage.save(next);

    }], callback);

}


function savePicture(req, res, file, filename, type, callback){
    var result = {};

    async.waterfall([function(next){

        require('gm')(file, filename)
        .size({bufferStream: true}, function(err, size) {
            if(err) return callback(err);
            result.size = size;
        })
        .stream(next);

    }, function(stdout, stderr, cmd, next){

        save(req, res, stdout, filename, type, next);

    }, function(storage, count, next){

        result.storage = storage._id;
        var picture = new PictureModel(result);
        picture.save(next);

    }], callback);
}

function upload(req, res, next, save){

    var fn = function(err, data){
        if(err) return res.status(401).json(err);
        res.json(data);
    };

    var url = req.param('url'),
        filename = req.body.name || req.query.filename || require('path').basename(url),
        type = req.query.mimetype || req.headers['content-type'] || mimetype.lookup(filename);

    if(url) return save(request(url), filename, type, fn);

    try{
        var busboy = new Busboy({headers: req.headers});
        busboy.on('file', function(fieldname, file, name, encoding, mimetype) {
            save(file, name || filename, mimetype, fn);
        });
        req.pipe(busboy);
    }catch(err){
        save(req, filename, type, fn);
    }

}


module.exports = function(app){

    app.post('/u', function(req, res, next){
        upload(req, res, next, save.bind(null, req, res));
    });

    app.post('/pic', function(req, res, next){
        upload(req, res, next, savePicture.bind(null, req, res));
    });

    app.get('/d/:id', function(req, res){
        StorageModel.findById(req.params.id, function(err, result){
            if(err) return res.status(401).json(err);
            if(!result) return res.status(404).end();
            res.type(result.mimetype).sendFile(CONFIG.PATH + '/' + result.file);
        });
    });

    app.get('/pic/:id', function(req, res, next){
        PictureModel.findById(req.params.id)
        .populate('storage')
        .exec(function(err, result){
            if(err) return res.status(401).json(err);
            if(!result || !result.storage) return res.status(404).end();
            res.type(result.storage.mimetype).sendFile(CONFIG.PATH + '/' + result.storage.file);
        });
    });

};
