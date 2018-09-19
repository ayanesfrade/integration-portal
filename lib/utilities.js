var exec = require('child_process').exec;

var usergrps = null;
var datapath = './data';

updatenodelist = function(reg) {
	var chilproc = exec('xmoscrpt ' + __dirname + '/updateNodeList.xms ' + reg, {cwd: __dirname}, function (error, stdout, stderr) { 
		 if (error) {
		        console.error('stderr', error);
		        //throw error;
		    }
		   // console.log('stdout', stdout);
	});
}

exports.updateallnodelist = function(reg) {
	updatenodelist('ATL');
	updatenodelist('ONT');
	updatenodelist('WST');
	updatenodelist('QUE');
}

exports.zipintfile = function(intdir) {
	var chilproc = exec(__dirname + '/zipintfile.bat ' + intdir, {cwd: __dirname}, function (error, stdout, stderr) { 
		 if (error) {
		        console.error('stderr', error);
		        //throw error;
		    }
		    //console.log('stdout', stdout);
	});
}

exports.getnodelist = function(reg, grp) {
	var json;

	var fs = require('fs'), xml2js = require('xml2js');
	var parser = new xml2js.Parser({
		explicitArray : false
	});
	
	var data = fs.readFileSync(datapath + '/NodeList/nodelist' + reg + '.xml', 'utf8');
	parser.parseString(data, function(err, result) {
		//console.log("result:" + JSON.stringify(result));
		json = result;
		json.groups = grp;
	});
	//console.log(JSON.stringify(json));
	return json;
};

exports.getgroups = function() {
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

exports.authenticate = function(email, password) {
	var fs = require('fs');

	var data = JSON.parse(fs.readFileSync(datapath + '/users.json', 'utf8'));
	//console.log("JSON file:" + JSON.stringify(data));
	if (usergrps === null) {
		this.getgroups();
	}
	var user = null;
	for ( var i in data) {
		if (email === data[i].email && password === data[i].password) {
			user = {};
			user.name = data[i].username;
			user.email = data[i].email;
			user.groups = usergrps.groups[data[i].group];
			user.member = data[i].group;
			break;
		}
	}
	//console.log("User:" + JSON.stringify(user));
	return user;
};

exports.register = function(user) {
	var fs = require('fs');

	var data = JSON.parse(fs.readFileSync(datapath + '/users.json', 'utf8'));
	//console.log("JSON file:" + JSON.stringify(data));

	data.push(user);
	fs.writeFileSync(datapath + '/users.json', JSON.stringify(data), 'utf8');

	console.log("User data:" + JSON.stringify(data));
	return true;
};

function getmimfileName(filename) {
	var res = filename.split(".");
	return res[0].toUpperCase();
}

function adddirdelimiter(path) {
	if (path.includes('/')){
		if (path.lastIndexOf("/") != path.length)
			return path + '/';
		else return path;
	}
	if (path.includes('\\')){
		if (path.lastIndexOf("\\") != path.length)
			return path + '\\';
		else return path;
	}
}

exports.mimconfig = function(interfacedata) {
	var fs = require('fs');
	
	var requestpath = datapath + '/requests';
	var mimtemplatespath = datapath + '/mimtemplates/';
	
	//Create interface name
	var ttype = interfacedata.interfaceType;
	var iheader = "";
	if (ttype === "FTP" || ttype === "AS2" || ttype === "F2F") {
		iheader = "F2F";
	} else {
		iheader = "F2M";
	}

	var interfacename = iheader + '_' + interfacedata.sourcenode + '_' + getmimfileName(interfacedata.intname);
	var fanning = interfacedata.destinationnodes.constructor == Array;

	//Check for multiple destinations
	if (!fanning) {
		interfacename = interfacename + "_" + interfacedata.destinationnodes;
	} else {
		interfacename = interfacename.replace(iheader, iheader + "F") + "_DL";
		iheader = iheader + 'F';
	}
	
	var requestpath = requestpath + '/' + interfacename;
	if (!fs.existsSync(requestpath)){
	    fs.mkdirSync(requestpath);
	}
	
	//********** Configure Dirmon entry **************
	var data = fs.readFileSync(mimtemplatespath + 'monitorentry.xml', 'utf8');
	//replace values in the the monitorentry
	data = data.replace("$XMDM_ENTRY_NAME$", interfacename.replace(iheader, iheader + "D"));
	data = data.replace("$XMDM_DIR$", interfacedata.sourcedirectory);
	data = data.replace("$XMDM_INCLUDE_DIR$", interfacedata.sourcfileinclude);
	if (interfacedata.sourcfileexclude) {
		data = data.replace("$XMDM_EXCLUDE_DIR$", interfacedata.sourcfileexclude);
	}
	data = data.replace("$XMDM_TEMPLATE_NAME$", interfacename + '.xml');
	//Select process based on the interface type.
	switch (ttype) {
		case "F2F" :
			data = data.replace("$XMDM_MIM_PROCESS$", "Sobeys_MIM_File_Transfer");
			break;
		case "F2M" :
			data = data.replace("$XMDM_MIM_PROCESS$", "WMB_Policy_Transfer");
			break;
		case "FTP" :
			data = data.replace("$XMDM_MIM_PROCESS$", "Sobeys_MIM_FTP_Put");
			break;
		case "AS2" :
			data = data.replace("$XMDM_MIM_PROCESS$", "Sobeys_MIM_FTP_Put");
			break;
		default :
			data = data.replace("$XMDM_MIM_PROCESS$", "Unknown_Process");
	}
	//Save dirmon entry.
	fs.writeFileSync(requestpath + '/' + interfacename.replace(iheader, iheader + "D") + '.xml', data, 'utf8');

	//Configure the template for faning or direct transfer
	if (fanning) {
		//********** Configure multiple dest request Template **************
		data = fs.readFileSync(mimtemplatespath + 'dl_requesttemplate.xml', 'utf8');
		data = data.replace("$XMDM_TEMPLATE_NAME$", interfacename);
		data = data.replace("$XMDM_SOURCE_NODE$", interfacedata.sourcenode);
		var dlname = getmimfileName(interfacedata.filenamesample) + '_FILES';
		data = data.replace("$XMDM_DESTINATIONLIST_NAME$", dlname);
		data = data.replace("$XMDM_DESTINATIONLIST_NAME$", dlname);
		//Save request template
		fs.writeFileSync(requestpath + '/'  + interfacename + '.xml', data, 'utf8');
		
		//Create destination list file and destiation files.
		var dltemp = fs.readFileSync(mimtemplatespath + 'destinationlist.xml', 'utf8');
		var dtemp = fs.readFileSync(mimtemplatespath + 'destination.xml', 'utf8');
		var metadata = fs.readFileSync(mimtemplatespath + 'metadata.xml', 'utf8');
		var destinations = interfacedata.destinationnodes;
		var imports = '';
		console.log('Destinations: ' + destinations);
		for (i in interfacedata.destinationnodes) {
			var dest = interfacedata.destinationnodes[i];
			console.log('Processing destination: ' + dest);
			var temp = dtemp;
			var destname = interfacename.replace('_DL', '') + "_" + dest;
			var destname = destname.replace('F2FF', 'F2F');
			var imp = '<import location="XML/Destination/' + destname + '.xml"></import>\n';
			imports = imports + imp;
			temp = temp.replace("$XMDM_DESTINATION_NODE$", dest);
			temp = temp.replace("$XMDM_DESTINATION_NAME$", destname);
			var mdata = metadata;
			var savemetadata = false;
			if ( interfacedata["destPatt" + dest] == '$XMDM_ORIGINAL_NAME$'){
				temp = temp.replace("$XMDM_DESTINATION_PATH$", adddirdelimiter(String(interfacedata["destDir" + dest])) + interfacedata["destPatt" + dest]);
			} else {
				savemetadata = true;
				var destpattern = interfacedata["destPatt" + dest];
				var pattern = destpattern.split(",");
				var parts = '';
				for (i in pattern){
					var parts = parts +  '<Part>' + pattern[i] + '</Part>\n';
				}
				mdata = mdata.replace("<Part></Part>", parts);
				mdata = mdata.replace("$XMDM_DATA_DIRECTORY$", adddirdelimiter(String(interfacedata["destDir" + dest])));
			}
			// Save destination file
			fs.writeFileSync(requestpath + '/'  + destname + '.xml', temp, 'utf8')
						
			if (interfacedata["callscript" + dest]){
				savemetadata = true;
				mdata = mdata.replace("$XMDM_NAME_DELIMITER$", '');
				mdata = mdata.replace("$XMDM_DATA_DIRECTORY$", adddirdelimiter(String(interfacedata["destDir" + dest])));
				mdata = mdata.replace("$XMDM_SCRIPT_DIRECTORY$", adddirdelimiter(String(interfacedata["scriptdir" + dest])));
				mdata = mdata.replace("$XMDM_SCRIPT_NAME$", interfacedata["scriptname" + dest]);
				mdata = mdata.replace("$XMDM_PARAM1$", "True");
				mdata = mdata.replace("$XMDM_PARAM1$", "");
			}
			//Save metadata
			if ( savemetadata ){
			   var metadataname = destname.replace('F2F', 'F2FM');
			   fs.writeFileSync(requestpath + '/'  + metadataname + '.XML', mdata, 'utf8');
			}
		}
		dltemp = dltemp.replace("<import/>", imports);
		dltemp = dltemp.replace("$XMDM_DESTINATIONLIST_NAME$", dlname);
		dltemp = dltemp.replace("$XMDM_DESCRIPTION$", dlname);
		fs.writeFileSync(requestpath + '/'  + dlname + '.xml', dltemp, 'utf8')
 
	} else {
		//********** Configure Request Template **************
		data = fs.readFileSync(mimtemplatespath + 'requesttemplate.xml', 'utf8');
		//replace values in the the monitorentry
		data = data.replace("$XMDM_TEMPLATE_NAME$", interfacename);
		data = data.replace("$XMDM_SOURCE_NODE$", interfacedata.sourcenode);
		data = data.replace("$XMDM_DESTINATION_NODE$", interfacedata.destinationnodes);
		var dest = interfacedata.destinationnodes;
		//Update metadata information for destinaiton file naming if needed.
		var mdata = fs.readFileSync(mimtemplatespath + 'metadata.xml', 'utf8');
		var savemetadata = false;
		if ( interfacedata["destPatt" + dest] == '$XMDM_ORIGINAL_NAME$'){
			var dpath = adddirdelimiter(String(interfacedata["destDir" + dest])) + '$XMDM_ORIGINAL_NAME$';
			data = data.replace("$XMDM_DESTINATION_PATH$", dpath);
		} else {
			savemetadata = true;
			var destpattern = interfacedata["destPatt" + dest];
			var pattern = destpattern.split(",");
			var parts = '';
			for (i in pattern){
				var parts = parts +  '<Part>' + pattern[i] + '</Part>\n';
			}
			mdata = mdata.replace("<Part></Part>", parts);
			mdata = mdata.replace("$XMDM_DATA_DIRECTORY$", adddirdelimiter(String(interfacedata["destDir" + dest])));
		}
		//Update metadate information for destinaiton script call if needed.
		if (interfacedata["callscript" + dest]){
			savemetadata = true;
			mdata = mdata.replace("$XMDM_DATA_DIRECTORY$", interfacedata["destDir" + dest]);
			mdata = mdata.replace("$XMDM_SCRIPT_DIRECTORY$", interfacedata["scriptdir" + dest]);
			mdata = mdata.replace("$XMDM_SCRIPT_NAME$", interfacedata["scriptname" + dest]);
			mdata = mdata.replace("$XMDM_PARAM1$", "True");
			mdata = mdata.replace("$XMDM_PARAM1$", "");
		}
		
		//Save request template
		fs.writeFileSync(requestpath + '/'  + interfacename + '.xml', data, 'utf8');
        
		//Save metadata
		if ( savemetadata ){
		   var metadataname = interfacename.replace('F2F', 'F2FM');
		   fs.writeFileSync(requestpath + '/'  + metadataname + '.XML', mdata, 'utf8');
		}
	}
	
	return interfacename;
};