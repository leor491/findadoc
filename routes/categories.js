'use strict';

var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');

var client = new cassandra.Client({contactPoints: ['127.0.0.1']});
client.connect(function(err, result){
	console.log("Cassandra connected...");
});

router.get('/add', function(req, res, next){
	res.render('add-category');
});

router.post('/add', function(req, res, next){
	var {name} = req.body;
	var query = 'INSERT INTO findadoc.categories(cat_id, name) values(?, ?);';

	//todo: uuid() vs. now() ?
	client.execute(query, [cassandra.types.uuid(), name], function(err, results){
		if(err){
			console.log(err);
			res.status(404).send();
		} else {
			//TypeError: Cannot add property 0, object is not extensible
			//res.app.locals.categories.push({name});
			res.location('/');
			res.redirect('/');
		}
	});
})

module.exports = router;