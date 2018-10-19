'use strict';

var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');

var client = new cassandra.Client({contactPoints: ['127.0.0.1']});
client.connect(function(err, result){
	console.log("Cassandra connected...");
});

router.get('/', function(req, res, next){
	var query = 'SELECT * FROM findadoc.doctors';

	client.execute(query, [], function(err, results){
		if(err){
			console.log(err);
			res.status(404).send();
		} else{
			res.render('doctors', {doctors: results.rows});
		}
	});

});

router.get('/add', function(req, res, next){
	res.render('add-doctor');
});

router.post('/add', function(req, res, next){
	var {full_name, category, practice_name, street_address, city, state, new_patients, accepting_patients, graduation_year} = req.body;
	
	if(accepting_patients==="Yes"){
		accepting_patients=true;
	}else if(accepting_patients==="No"){
		accepting_patients=false;
	}else{
		accepting_patients=undefined;
	}

	graduation_year = Number(graduation_year);
	//todo: uuid() vs. now() ?
	var query = "INSERT INTO findadoc.doctors(doc_id, full_name, category, practice_name, street_address, city, state, new_patients, graduation_year) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
	client.execute(query, [cassandra.types.uuid(), full_name, category, practice_name, street_address, city, state, new_patients, graduation_year], {prepare: true}, function(err, result){
		if(err){
			console.log(err);
			res.status(404).send();
		} else{
			//req.flash({success: `Added doctor`});
			res.location('/doctor');
			res.redirect('/doctor');
		}
	});
});

router.get('/details/:id', function(req, res, next){
	var query = "SELECT * FROM findadoc.doctors WHERE doc_id = ?";
	client.execute(query, [req.params.id], function(err, result){
		if(err){
			console.log(err);
			res.status(404).send();
		} else{
			res.render('details', {doctor: result.rows[0]});
		}
	});
});

router.get('/state', function(req, res, next){//todo !
	var query = "SELECT * FROM findadoc.doctors WHERE state = ?";

	client.execute(query, [req.query.state], function(err, results){
		if(err){
			console.log(err);
			res.status(404).send();
		} else {
			//injection?
			res.render('doctors', {doctors: results.rows, state: req.query.state});
		}
	});
});

router.get('/category/:name', function(req, res, next){
	var query = "SELECT * FROM findadoc.doctors WHERE category = ?";
	client.execute(query, [req.params.name], function(err, results){
		if(err){
			console.log(err);
			res.status(404).send();
		} else{
			//injection?
			res.render('doctors', {doctors: results.rows, category: req.params.name});
		}
	});
});

module.exports = router;