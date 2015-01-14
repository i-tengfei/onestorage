var StorageModel = mongoose.model('storage'),
    request = require('request'),
    mongoose = require('mongoose'),
    Busboy = require('busboy'),
    Storage = require('./Storage');

var storage = new Storage(CONFIG.PATH);

module.exports = function(app){

app.post('/u', function(req, res, next){

    function save(file, filename, mimetype){
        storage.stream(file, function(err, id){
            filename = filename || id;
            var storage = new StorageModel({
                name: req.body.name || filename,
                filename: filename,
                file: id,
                mimetype: mimetype || req.headers['content-type']
            });
            storage.save(function(err, storage){
                if(err){
                    console.log(err);
                    next(err);
                }else{
                    res.json(storage);
                }
            });
        });
    }

    var url = req.param('url');
    if(url){
        return save(request(url));
    }

    try{
        var busboy = new Busboy({headers: req.headers});
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            save(file, filename, mimetype);
        });
        req.pipe(busboy);
    }catch(err){
        save(req, req.query.filename, req.query.mimetype);
    }

});

app.get('/d', function(req, res){
    res.send('a');
});
};
