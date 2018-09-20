var express = require('express'), 
    utilities = require('./lib/utilities.js'),
    dbms = require('./lib/dbms.js'),
    helpers = require('./lib/helpers'),    
    formidable = require('formidable'),
    url = require('url');

/*require the ibm_db module*/
var ibmdb = require('ibm_db');

var app = express();

var credentials = require('./credentials.js');
var emailService = require('./lib/email.js')(credentials);

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
	defaultLayout : 'main',
	helpers : helpers
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave : false,
	saveUninitialized : false,
	secret : credentials.cookieSecret,
}));

app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

function requireLogin(req, res, next) {
	if (!req.session.user) {
		res.redirect('/login');
	} else {
		next();
	}
};

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/home', function(req, res) {
	res.render('home');
});


app.get('/login', function(req, res) {
	res.render('login', {
		"pagetitleheader" : "PORTAL",
		"pagetitlesmall" : "User loging"
	});
});


app.post('/login', function(req, res) {
	console.log('Authenticating user: ' + req.body.email);
	//var user = utilities.authenticate(req.body.email, req.body.password);
	dbms.authenticate(req, res);
});

app.get('/register', function(req, res) {
	var data = utilities.getgroups();
	data.pagetitleheader = 'PORTAL';
	data.pagetitlesmall = 'User register';
	//console.log("Register data:" + JSON.stringify(data));
	res.render('register', data );
});

app.post('/register', function(req, res) {
	console.log('Registering user: ' + req.body.username);
	console.log('Form content: ' + JSON.stringify(req.body));
	if (utilities.register(req.body)){
		res.render('login');
	} else {
		res.render('register');
	}
});

app.get('/miminterfacerequest', requireLogin , function(req, res) {
	//var data = utilities.getnodelist("ATL", req.session.user.groups);
	//console.log("data:" + JSON.stringify(data));
	//data.pagetitleheader = 'Interface Requirements';
	//data.pagetitlesmall = 'Data Collection';
	//data.user = req.session.user.name;
	//data.member = req.session.user.member;
	//res.render('miminterfacerequest', data);

	var p = url.parse(req.url, true);
	
	if(p.search) {
		var parameter = p.query;
		dbms.loadWithRegion(req, res, parameter.id);	//this loads the page with the region in the interface
	}
	else
	{
		var data = utilities.getnodelist("ATL", req.session.user.groups);
	
		data.pagetitleheader = 'Interface Requirements';
		data.pagetitlesmall = 'Data Collection';
		data.user = req.session.user.name;
		data.member = req.session.user.member;
		res.render('miminterfacerequest', data);
	}
});


app.post('/regionselected', requireLogin , function(req, res) {
    if(req.xhr || req.accepts('json,html')==='json'){
		var data = utilities.getnodelist(req.body.mimenv, req.session.user.groups);
		//console.log("data:" + JSON.stringify(data));
		//console.log(req.session.user.groups);
		data.pagetitleheader = 'Interface Requirements';
		data.pagetitlesmall = 'Data Collection';
		data.user = req.session.user.name;
		data.member = req.session.user.member;
		res.send({ success: true, jsdata: data, message: req.body.mimenv});
	}
});

app.post('/interfacereqfill', requireLogin , function(req, res) {

    if(req.xhr || req.accepts('json,html')==='json'){
    	//console.log(req.session.user);

    	var p = url.parse(req.body.url, true);
	
		if(p.search) {
			var inameid = p.query;
			dbms.interfacereqfill(req, res, inameid.id);
		}
		else
			res.send({success: true, role: req.session.user.member});
	}
});

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/miminterfacerequest', requireLogin , function(req, res) {
    if(req.xhr || req.accepts('json,html')==='json'){
		// if there were an error, we would send { error: 'error description' }
    	//console.log('User:' + req.session.user.name + ' Interface request content: ' + JSON.stringify(req.body));

    	var intname = utilities.mimconfig(req.body);
    	
		if (intname) {
			if(req.body.inameid != "") {
				dbms.updateInterfaceReq(req, res, intname);
				res.send({ success: true, message: "Interface request has been updated" });
			}
			else {
				dbms.insertInterfaceReq(req, res, intname);
				res.send({ success: true, message: "Interface request completed, you will receive a confirmation email" });
			}
		}
		else {
			res.send({ success: true });
		}	
    }
    else {
    	res.status(500);
	}
});

app.post('/miminterfacedeploy', requireLogin , function(req, res) {
    if(req.xhr || req.accepts('json,html')==='json'){
    	var intname = utilities.mimconfig(req.body);
    	
		if (intname) {
			/*utilities.zipintfile(intname);
			var data = req.body;
			data.name = req.session.user.name;
			data.email = req.session.user.email;
			res.render('email/mim_int_req_confirmation', {layout : null,data : data }, function(err, html) {
				if (err) 
					console.log('error in email template');
				while (!fs.existsSync('data/requests/' + intname + '.zip' ));
				emailService.send(data.email, 'Integration Portal MIM Interface Request', html, intname);
			});*/
			res.send({ success: true, message: "Interface request has been deployed!" });
		}
		else {
			res.send({ success: true });
		}	
    }
    else {
    	res.status(500);
	}
});

app.get('/mimsearch', function(req, res) {
	var data = {};
	//console.log("data:" + JSON.stringify(data));
	data.pagetitleheader = 'MIM SEARCH';
	data.pagetitlesmall = 'Source-Destination file search';
	//data.user = req.session.user.name;
	//data.member = req.session.user.member;
	res.render('mimsearch', data);
});

var fs = require('fs');
var mimdatabases = JSON.parse(fs.readFileSync('data/mimdatabases/connections.json', 'utf8'));

app.get('/filesearch', function(req, res) {
		var text = req.query.text;
		var daterange = req.query.daterange;
		console.log('Ajax request text: ' + text);
		var dates = daterange.split('-');
		var from = dates[0].trim();
		var to = dates[1].trim();
		var connstr = mimdatabases[req.query.mimenv];
		console.log('Ajax request daterange from:' + from + 'to:' + to + "Connection:" + JSON.stringify(connstr));
		ibmdb.open("DRIVER={DB2};DATABASE=" + connstr.database + ";UID=xmuser;PWD=pm44mp;HOSTNAME=" + connstr.server + ";port=" + connstr.port, function(err, conn) {
			if (err) {
				/*
				 * On error in connection, log the error message on console
				 */
				console.error("error: ", err.message);
			} else {
				//"select processName,processId,startTime,endTime from process where processId in (select processId from activity where activityid in (select processid from activity where activityid in (select processId from activity where activityid in (select activityid from reference where data like '%" + text + "%')))) or description like '%" + text + "%' and VARCHAR_FORMAT (startTime,'MM/DD/YYYY') = '" + from + "'"  
        	    conn.query("select processName,processId,startTime,description from process where (processId in (select processId from activity where activityid in (select processid from activity where activityid in (select processId from activity where activityid in (select activityid from reference where (data like '%" + text + "%') and (referenceTime between timestamp('" + from + "', '00:00:00') and timestamp('" + to + "', '24:00:00')))))) or description like '%" + text + "%')  and (processtype is null) and (startTime between timestamp('" + from + "', '00:00:00') and timestamp('" + to + "', '24:00:00')) order by startTime asc", function(err, interfaces, moreResultSets) {
				     if (err){
				        console.error("error: ", err.message);
				     }
				     console.log('Query results:' + JSON.stringify(interfaces));
        	    	 res.send({records:interfaces, server:connstr.server});
				     conn.close(function() {console.log("Connection Closed");});
				});
			}
		});
});

app.get('/esbservicecatalog', function(req, res) {
	var data = {};
	//console.log("data:" + JSON.stringify(data));
	data.pagetitleheader = 'IT Integration Services Catalog';
	data.pagetitlesmall = 'Inbound-Outbound services by Region and National';
	//data.user = req.session.user.name;
	//data.member = req.session.user.member;
	res.render('esbservicecatalog', data);
});

app.get('/getservercatalog', function(req, res) {
	console.log('Ajax request text: ' + req.query.esbserver);
	var server = req.query.esbserver;
	try {
		var servercatlg = JSON.parse(fs.readFileSync('data/ServiceCatalogs/' + server + '.json', 'utf8'));
		res.send({
			records : servercatlg
		});
		console.log('Selected server catalog:' + JSON.stringify(servercatlg));
	} catch (err) {
		console.error('Error loading Service Catalog for server:' + server);
		res.status(500);
		res.send({
			records : []
		});
	}
});

app.get('/getinterfaceList', requireLogin , function(req, res) {
	dbms.interfaces( req.session.user.id, req.session.user.member, res);
});

app.post('/updateInterface', function(req, res) {
	console.log(req.body);
	var data = req.body;
	data.mssg1 = "Thanks again for using the Integration Portal";
	dbms.updateInterface(data,res);
	if (data.status == "assigned" ) {
		data.mssg2 = "has been assigned to";
		res.render('email/mim_int_req_confirmation', {layout : null,data : data }, function(err, html) {
			if (err) console.log('error in email template');
			emailService.send(data.reqemail, 'The MIM Interface you requested has been assigned', html,'');
		})
		res.render('email/mim_int_req_confirmation', {layout : null,data : data }, function(err, html) {
			if (err) console.log('error in email template');
			emailService.send(data.intmemberemail, 'MIM Interface assigment notification.', html,'');
		})
	} if (data.status == "completed" ) {
		data.mssg2 = "has been completed by";
		res.render('email/mim_int_req_confirmation', {layout : null,data : data }, function(err, html) {
			if (err) console.log('error in email template');
			emailService.send(data.intmemberemail, 'The MIM Interface you requested has been completed', html,'');
		})
	}
});

app.get('/signout', requireLogin , function(req, res) {
	delete req.session.user;
	res.render('home',{
		"pagetitleheader" : "PORTAL",
		"pagetitlesmall" : "Home Page"
	});
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	//update node list when people log in
	//utilities.updateallnodelist();
	dbms.dbconnect();
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
