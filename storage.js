var fs = require('fs'),
    os = require('os'),
    crypto = require('crypto'),
    request = require('request'),
    UUID = require('node-uuid');

function generateID(stream, callback) {

    var sha1 = crypto.createHash('sha1'),
        md5 = crypto.createHash('md5');
    sha1.setEncoding('hex');
    md5.setEncoding('hex');

    stream.on('end', function() {
        sha1.end();
        md5.end();
        callback(null, sha1.read() + '-' + md5.read());
    });

    stream.pipe(sha1);
    stream.pipe(md5);

}

function Storage(path) {
    this.path = path;
}

Storage.prototype = {
    constructor: Storage,
    stream: function(stream, callback) {

        var oldPath = this.path + '/' + UUID.v4(),
            newPath = this.path + '/';

        stream.pipe(fs.createWriteStream(oldPath));

        generateID(stream, function(err, id) {
            fs.exists(newPath += id, function(exists) {
                if(exists){
                    fs.unlink(oldPath);
                    callback && callback(null, id);
                }else{
                    fs.rename(oldPath, newPath, function() {
                        callback && callback(null, id);
                    });
                }
            });
        });

    },

    save: function(path, callback) {
        this.stream(createReadStream(path), callback);
    },
    load: function(url, callback) {
        this.stream(request(url), callback);
    },
    read: function(id) {
        return fs.createReadStream(this.path + '/' + id);
    },
    remove: function(id, callback) {
        fs.unlink(this.path + '/' + id, callback);
    }
};

module.exports = Storage;
