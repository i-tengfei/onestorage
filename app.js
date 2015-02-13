var CONFIG = global.CONFIG = require('./config');
if(process.env.NODE_ENV){
    require('onetool').mix(CONFIG, require('./config.' + process.env.NODE_ENV));
}

require('./database');

var bodyParser = require('body-parser');

var app = require('express')();

app.listen(CONFIG.PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

require('./router')(app);