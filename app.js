var CONFIG = global.CONFIG = require('./config');
if(process.env.NODE_ENV){
    require('onetool').mix(CONFIG, require('./config.' + process.env.NODE_ENV));
}

require('./database');

var bodyParser = require('body-parser'),
    auth = require('passport-oneuser').auth;

var app = require('express')();

app.listen(CONFIG.PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(auth(CONFIG.AUTH));

require('./router')(app);
