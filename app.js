
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, mongoose = require('mongoose')
	, User = require('./user-model')
	, http = require('http')
	, path = require('path')
	


var app = express();
//configuration
app.configure('development',function(){
	app.set('port', 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
//middleware
	app.use(express.favicon("public/img/favicon.png"));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({secret: 'my secret'}));
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
//authentication sessions
	app.use(function(req, res, next){
			if(req.session.loggedIn){
				res.locals.authenticated = true;
				User.findById(req.session.loggedIn, function(err,user){
					if(err)return next(err);
					res.locals.me = user;
					next();
				});
			}else {
				res.locals.authenticated = false;
				next();
			}
	});
	app.use(function(err,req,res,next){
		// Just basic, should be filled out to next()
		// or respond on all possible code paths
		if(err instanceof Error){
		    
		        res.redirect('/');
		}
	});
});

app.use(app.router);



//mongoose connect to database!
var connStr = 'mongodb://localhost:27017/beernation';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

//set app flow here.
app.get('/', routes.login);
app.post('/login/signin', routes.signin);
app.get('/signup', routes.signup);
//app.get('/login/:signupEmail', routes.success);
app.post('/signup', routes.newUser);
app.get('/logout', routes.logout);
//authentication required
app.get('/home', routes.secure, routes.home);
app.get('/getList',routes.secure, routes.getList);

app.get('/addBeer', routes.secure, routes.findBeer);
app.get('/addBeer/brewerLookup/:query', routes.brewerLookup);
app.get('/beerLookup', routes.secure, routes.beerLookup);

app.post('/addBeer', routes.secure, routes.add);

app.get('/editBeer/:beerID', routes.secure, routes.editBeer);
app.post('/editBeer', routes.secure, routes.editList);
app.get('/deleteBeer/:beerID',routes.secure,  routes.deleteBeer);
app.get('/brewers', routes.secure, routes.brewerPage);
app.get('/pubs', routes.secure, routes.pubPage);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



















