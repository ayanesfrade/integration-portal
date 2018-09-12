var nodemailer = require('nodemailer');

module.exports = function(credentials){

	var mailTransport = nodemailer.createTransport({
		host: 'smtp1.sobeys.com',
		secureConnection: false,
		port: 25,
	    tls: {rejectUnauthorized: false},
        debug:true
	});

	var from = '"Sobeys IT Integration" <SobeysITIntegration@sobeys.com>';
	var errorRecipient = 'alejandro.yanes@sobeys.com';
	var attachmentpath = './data/requests/';

	return {
		send: function(to, subj, body, filename){
			var mailOption = {
			        from: from,
			        to:  to,
			        subject: subj,
			        html: body,
			        generateTextFromHtml: true
			    }
			if (filename){
				var attachmentname = filename +'.zip';
				var filecontent = attachmentpath + attachmentname;
				mailOption.attachments = [{filename:attachmentname, path:filecontent} ];
			}

			mailTransport.sendMail(mailOption, function(err){
		        if(err) console.error('Unable to send email: ' + err);
		    });
		},

		emailError: function(message, filename, exception){
			var body = '<h1>Sobeys Integration Portal Site Error</h1>' +
				'message:<br><pre>' + message + '</pre><br>';
			if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
			if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
		    mailTransport.sendMail({
		        from: from,
		        to: errorRecipient,
		        subject: 'Sobeys Integration Portal Site Error',
		        html: body,
		        generateTextFromHtml: true
		    }, function(err){
		        if(err) console.error('Unable to send email: ' + err);
		    });
		},
	};
};
