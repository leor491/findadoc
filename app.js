'use strict';

var express = require('express');
var path = require('path');
var nodemailer = require('nodemailer');
var exphbs = require('express-handlebars');

var main = require('./routes/index');
var doctors = require('./routes/doctors');
var categories = require('./routes/categories');

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '/public')));

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function(){
	console.log(`App started on port: ${app.get('port')}`);
});

app.set('view engine', 'handlebars');//handlebars or mustache?
app.set('views', './views');
//app.engine('handlebars', exphbs({defaultLayout: 'main', partialsDir: 'partials'}));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints: ['127.0.0.1']});
client.connect(function(err, result){
	//console.log("Cassandra connected...");
});

/*
var query = "SELECT name FROM findadoc.categories";
client.execute(query, [], function(err, results){
	if(err){
		console.log(err);
		res.status(404).send();
	} else{
		app.locals.categories = results.rows;
	}
});
*/

app.get('*', function(req, res, next){
	var query = "SELECT * FROM findadoc.categories";
	client.execute(query, [], function(err, results){
		if(err){
			console.log(err);
			res.status(404).send();
		} else{
			app.locals.categories = results.rows;
			next();
		}
	});
});

app.use('/', main);
app.use('/doctor', doctors);
app.use('/category', categories);