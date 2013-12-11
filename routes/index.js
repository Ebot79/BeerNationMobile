//routes/index.js
//requires
var  User = require('../user-model')
	,BreweryDb = require('brewerydb-node')
	,qs = require('querystring')
	,http = require('http')
	,async = require('async');

//brewerydb connection
var brewdb = new BreweryDb('88192fcae992b278f4a47fa5b8d561bb');


//security
exports.secure = function(req,res,next){
    if(req.session.loggedIn){
        next();
    }else{
        res.redirect('/');//not autherized
    }
}


/*signup route
/ shows signup form, gathers user data
*/
exports.signup = function(req, res, next){
	console.log('signup');
	res.render('signup');
	}

/*default route
/ Shows log in form
*/
exports.login = function (req, res, next){	
	console.log('default');	
	
	res.render('login',{pageTitle:'Nation of Beer', message:'under development' });
	}




//signup POST route processing 
exports.newUser = function(req, res, next){
	console.log('signup POST route');
	
	var testUser = new User(req.body.user);
	console.log(testUser);
	testUser.save(function(err) {
  	if(err) {
  		console.error(err);  	
  		res.redirect('/');  	
  	}else	res.redirect('/');	
	});
	}
	


//login processing route
exports.signin = function(req, res){
	User.findOne({email:req.body.user.email}, function(err, user, next){
	
		if(err) return next(err);
		if(!user) return res.send('<p>User not found. Go back and try again</p>');
		console.log(req.body.user.password);
//check password
		user.comparePassword(req.body.user.password, function(err, isMatch){
			if(err) throw err;
			console.log(""+isMatch);
			if(isMatch){
			//not setting session variable????????????????????????????????????????????????????????????
			//resolved by moving app.use(routes ) under the assignment of this variable.
				console.log(user._id.toString());
				req.session.loggedIn = user._id.toString();
				res.redirect('/home');
			}else return res.send('<p>User not found. Go back and try again</p><a type="button" href="/beer" class="btn"> Back</a>');
		});	
	});
	}
// page home beer
exports.home = function (req, res, next){
	console.log(res.locals.me.first);
	res.render('home');
	}
	
// get beerListData
exports.getList = function (req, res, next){
	var beerList = res.locals.me.beerList
	,idList =[]
	,i;
	for( i = 0; i<beerList.length; i++ ){
		idList.push(beerList[i].brewerydbId);
	}
	console.log('idLlist length: '+idList.length);
	async.map(idList, getBeer, function(err,results){
		if(err){
			message += 'failed to get beers';
				res.status(500);
			}
			if(results){
			
			console.log('beersSent');
			res.send(results);
			}
	});
	
	function getBeer(beer, cb){
			path = 'http://api.brewerydb.com/v2/beer/'+beer+'/?withBreweries=Y&key=88192fcae992b278f4a47fa5b8d561bb';
			console.log(path);
			http.get(path, function(response){
				var dbObject='';
				response.on('data', function (chunk) {
					dbObject += chunk;
				});
				response.on('end', function(){
					parseData = JSON.parse(dbObject);
					cb(null, parseData.data);//the obj returned by the brewerydb has a header data is the body
				});
			});//end get!!!
		}


	
}//end home



//logout route
exports.logout = function(req, res, next){
	req.session.loggedIn = null;
	res.redirect('/');
	}



//find beer route
exports.findBeer = function(req, res, next){
	console.log('findBeer');
	res.render('findBeer',{pageTitle:'brew search'});
}
	
	

//brewerLookup
exports.brewerLookup = function(req, res, next){
	var query = req.params.query;
	console.log(query);
	var brewers = [], i;
		brewdb.breweries.find({name: query+'*'}, function(err, data){
			if(err || data==null) {
				console.log(err);
				res.send(brewers);
			}else{
			
				for(i=0;i<data.length;i++){
					brewers.push(data[i].name);
				}
				res.send(brewers);
			}
		});
}


//beerLookup using Brewerydb's RESTful api
exports.beerLookup = function(req, res, next){
	console.log('beerLookup');
	console.log(req.query.brewery);
	
	var brewer = req.query.brewery
		,beers
		,i;
	console.log('recieved brewer name: '+brewer);
	brewdb.breweries.find({name:brewer}, function(err, data){
		if(err || data==null) {
			console.log(err);
			console.log('no brewer found')
		}else{
		
		
		//make http request
			//prep options
			console.log('Making db request');
			console.log(data[0].id);
			
			path = 'http://api.brewerydb.com/v2/brewery/'+data[0].id+'/beers/?key=88192fcae992b278f4a47fa5b8d561bb';
		//send request
			http.get(path, function(response){
			var dbObject='';
			response.on('data', function (chunk) {
				
				dbObject += chunk;
			});
				
				response.on('end', function(){
					
					//console.log(dbObject);
					res.send(dbObject);
					
				});
			});
			
		}
	});
}

//add beer POST route
exports.add = function(req, res, next){
	console.log('addBeer POST route');
	userBeer = res.locals.me.beerList;
	console.log(userBeer[0].name);
	
	console.log(req.body);
	
	User.findByIdAndUpdate(req.session.loggedIn
		,{$push: {beerList: req.body}}
		,{upsert:true}
		,function(err,user){
			if(err){ 
				console.log(err);
				
			}else{
				console.log('beer added');
				res.end();
			}
		
	});
	
}

exports.deleteBeer = function(req, res, next){

	console.log('deleteBeer with id'+req.params.beerID);
	User.findByIdAndUpdate(req.session.loggedIn
		,{$pull: { beerList: { _id: req.params.beerID}}}
		,function (err, user){
			if(err)console.log(err);
			res.redirect('/beer');
	});
}




