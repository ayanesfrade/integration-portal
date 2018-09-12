/**
 * New node file
 */

var mysql = require('mysql');
var table = {};
var usergrps = null;
var datapath = './data';
var intmemebers = [];


table.user = 'user';
table.interface = 'interface';


var con = mysql.createConnection({
  host: "itportalmysql",
  user: "xmuser",
  password: "pm44mp",
  database: "itportaldb"
});


exports.dbconnect = function() {
	con.connect(function(err) {
		if (err)
			throw err;
		else {
			console.log("db connected!");
			getintmemebers();
			return con;
		}
	});
}


getgroups = function() {
	if (usergrps === null) {
		var fs = require('fs');
		var json = JSON.parse(fs.readFileSync(datapath + '/groups.json', 'utf8'));
		//console.log(JSON.stringify(data));
		var data = {};
		data.groups = json;
		usergrps = data;
		return data;
	} else {
		return usergrps;
	}
};

function getintmemebers() {
	
	var sql = "SELECT * FROM user WHERE role='integration'";

	con.query(sql, function (err, result, fields) {
		if (err) 
			throw err;
		else {
			
			if(result.length > 0) {
				//console.log(result);
				intmemebers = result;
			}
			else {
				console.log("Could not get Integration group member list!");
			}
		}
	});
}

exports.authenticate = function(req, res) {
	
	email = req.body.email;
	password = req.body.password;
	
	var sql = "SELECT * FROM " + table.user + " WHERE email='" + email + "' AND password='" + password + "'";

	con.query(sql, function (err, result, fields) {
		if (err) 
			throw err;
		else {
			var user = null;
			//console.log(result);
			
			if(result.length > 0) {
			  	user = {};
			  	user.id = result[0].user_id;
				user.name = result[0].name;
				user.email = result[0].email;
				usergrps = getgroups();
				user.groups = usergrps.groups[result[0].role];
				user.member = result[0].role;
				
				req.session.user = user;
				res.redirect('miminterfacerequest');
			}
			else {
			  	res.render('login');
			}
		}
	});
}

exports.interfaces = function(uid,role,res) {
	var scriteria ="";
	if (role != "integration")
		scriteria = "SELECT it.* ,usr.name as aname, usr.email as aemail FROM (SELECT i.*,u.name,u.role,u.email as uemail FROM interface as i, user as u WHERE i.requester='" + uid + "' and u.user_id='" + uid + "') as it LEFT JOIN user as usr ON usr.user_id=it.assignee";
	else
		scriteria = "SELECT it.* ,usr.name as aname, usr.email as aemail FROM (SELECT i.*,u.name,u.role,u.email as uemail FROM interface as i LEFT JOIN user as u ON u.user_id=i.requester) as it LEFT JOIN user as usr ON usr.user_id=it.assignee";
	
    var sql = scriteria;

	con.query(sql, function (err, result, fields) {
		if (err) 
			throw err;
		else {
			//console.log(result);
    		if(result.length > 0) {
				var data = {};
				data.pagetitleheader = 'My interfaces';
				data.pagetitlesmall = 'List of the interfaces created or assigned to me.';
				data.urole = role;
				data.interfaces = [];
				for (i in result) {
					var s = String(result[i].requesting_date);
					result[i].requesting_date = s.substring(0,24);
					s = String(result[i].assigned_date);
					result[i].assigned_date = s.substring(0,24);
					data.interfaces.push(result[i]);
				}
				data.intgroup = intmemebers;
				//console.log(data);
				res.render('interfacelist', data);
			}
			else {
			  	res.render('login');
			}
		}
	});
}

exports.updateInterface = function(data, res) {
	    cdate = new Date();
	    var sql ='';
	    // Create SQL query based on the ajax call data.
	    switch(data.status) {
	        case 'assigned':
	        	sql = "UPDATE interface SET assignee = " + data.intmember + ", status = '" + data.status + "', assigned_date = NOW() WHERE interface_id = '" + data.intid + "'";
	            break;
	        case 'completed':
	            sql = "UPDATE interface SET assignee = " + data.intmember + ", status = '" + data.status + "', completion_date = NOW() WHERE interface_id = '" + data.intid + "'";
	            break;
	        default:
	        	sql = "UPDATE interface SET assignee = " + data.intmember + ", status = '" + data.status + "' WHERE interface_id = '" + data.intid + "'";
	    }
        
	    // Update database with the correct info.
		con.query(sql, function(err, result) {
			if (err)throw err;
			console.log(result.affectedRows + " record(s) updated");
			res.send({ success: true, message: "Interface information has been updated" });
		});
}

exports.getEmailInfo = function(data) {
    cdate = new Date();
    var sql ="SELECT * FROM user WHERE user_id='" + date;
        
    // Get database info.
	con.query(sql, function(err, result) {
		if (err)throw err;
		console.log(result.affectedRows + " record(s) updated");
		res.send({ success: true, message: "Interface information has been updated" });
	});
}