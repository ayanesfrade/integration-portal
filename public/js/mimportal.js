$(function() {
	// Initialize Select2 Elements
	$('.select2').select2();

	// Flat red color scheme for iCheck
	$('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
		checkboxClass : 'icheckbox_flat-green',
		radioClass : 'iradio_flat-green'
	});
	
	 //Date picker
    $('#datepicker').datepicker({
      autoclose: true
    });
    
    //Date range picker
    $('#daterange').daterangepicker();
    
    // Get containers for destination nodes data
	var dcontainer = $(document.getElementById('destdata'));
	var dscrptcont = $(document.getElementById('destscripts'));
	
	var selected;
	var delimiter = '.';
	
	// A $( document ).ready() block.
	$( document ).ready(function() {
		var sectitle = $('#sectiontitle').text();
		
		if ( sectitle.match("IT Integration Services Catalog")){
			$('#mimsearchtree').addClass("treeview");
			$('#mimintreqmenu').removeClass("active");
			$('#servcatalogmenu').addClass("active");
		}
		
		if ( sectitle.match("MIM SEARCH")){
			$('#mimsearchtree').addClass("active treeview menu-open")
			$('#mimintreqmenu').removeClass("active");
			if ( sectitle.match("Source-Destination file search")){
				$('#filesearchli').addClass("active");
				$('#idocsearchli').removeClass("active");
			}else{
				$('#idocsearchli').addClass("active");
				$('#filesearchli').removeClass("active");
			}
		}
		
	});
	
	$('input').on('ifChecked', function(event){
		  var id = $(this).attr('id');
		  switch (id) {
	    		case "sourfilearchive" :
	    			$('#archivegrp').show();
	    			break;
	    		case "optionsRadio1" : case "optionsRadio2" :
	    			$('#extcommgrp').hide();
	    			break;
	    		case "optionsRadio3" : case "optionsRadio4" :
	    			$('#extcommgrp').show();
	    			break;
	    		case "optionsRadios1" : case "optionsRadios2" :
	    			var sourceboxid = String($('#textBoxid').val());
	    	    	$( '#spattcontainer' ).empty();
	    	    	$( '#sfieldsvalues' ).empty();
	    	    	$( '#fieldbttns' ).empty();
	    	    	$( '#dpattcontainer' ).empty();
	    	    	destinatioPatt = '';
	    	    	var sname = String( $( 'input[name="filenamesample"]' ).val() );
	    	    	delimiter = $(this).val();
	    	    	var sfields = sname.split( delimiter );
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnsourcefile">Source File Name</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttndot">"."</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttndash">"-"</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnunder">"_"</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnMD">MMDD</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnfulldate">YYYYMMDD</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnfullshortyear">YYMMDD</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttntime">HHMMSS</button>');
	    	    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnHM">HHMM</button>');
	    	    	for (i in sfields) {
	    	    		$( '#spattcontainer' ).append('<td><span class="label label-success">Field' + i + '</span></td>');
	    	    		$( '#sfieldsvalues' ).append('<td><span class="label label-success">' + sfields[i] + '</span></td>');
	    	    		$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnField' + i + '">Field' + i + '</button>');
	    	     	}
	    	    	
	    	   		$( "#destfileName" ).val('$XMDM_ORIGINAL_NAME$');
	    			break;
	    		case "regionRadio1" : case "regionRadio2" : case "regionRadio3" : case "regionRadio4" :
	    			$.ajax({
	                    url: 'regionselected',
	                    type: 'POST',
	    				data: $(this).serialize(),
	                    success: function(data){
	                        if(data.success){
	                        	populateSourceNodes(data.jsdata);
	                        	populateDestinationNodes(data.jsdata);
	                        	//$('#successtxt').html(data.message);
	                        	//$('#modal-success').modal();
	                        } else {
	                        	$('#errortxt').html(data.message);
	                        	$('#modal-danger').modal();
	                        }
	                    },
	                    error: function(){
	                        $container.html('There was a problem.');
	                    }
	                });
	    			break;
	    		default :
          }
	});


	function populateSourceNodes(data)
	{
		var options = "", gpname;

		for (var i in data.groups) {
			gpname = data.groups[i];
			for(var j in data.nodelist[gpname].server) {
				if(Array.isArray(data.nodelist[gpname].server))
					options += "<option value=" + data.nodelist[gpname].server[j].mimnode + ">" + data.nodelist[gpname].server[j].servername + " - MIM node (" + data.nodelist[gpname].server[j].mimnode + ")</option>";
				else
					options += "<option value=" + data.nodelist[gpname].server.mimnode + ">" + data.nodelist[gpname].server.servername + " - MIM node (" + data.nodelist[gpname].server.mimnode + ")</option>";
				
			}
		}

		$('#sourcenode').html(options);
	}


	function populateDestinationNodes(data)
	{
		var options = "";

		for (var i in data.nodelist) {
			for(var j in data.nodelist[i].server) {
				if(Array.isArray(data.nodelist[i].server))
					options += "<option value=" + data.nodelist[i].server[j].mimnode + ">" + data.nodelist[i].server[j].servername + " - MIM node (" + data.nodelist[i].server[j].mimnode + ")</option>";
				else
					options += "<option value=" + data.nodelist[i].server.mimnode + ">" + data.nodelist[i].server.servername + " - MIM node (" + data.nodelist[i].server.mimnode + ")</option>";
			}
		}

		$('#destinationnodes').html(options);
	}
	
	$('input').on('ifUnchecked', function (event) {
		var id = $(this).attr('id');
		  if (id=='sourfilearchive'){
			  $('#archivegrp').hide();
		  }
	});
		
	$('#destinationnodes').change(function() {
		// Add container for destination.
		
		var values = $(this).val();
        if (values == ""){
        	$(dcontainer).empty();
    		$(dscrptcont).empty();
        }else {
        	for (i in values) {
    			// Create destination directories and file containers
        		var elem = $(document.getElementById('divdir' + values[i]));
    			if (elem.length == 0)
    			{
    			   $(dcontainer).append('<div class="form-group" id="divdir' + values[i] + '">');
    			   $('#divdir' + values[i]).append('<label>' + values[i] + ' Destination Directory</label><input type="text" class="form-control" placeholder="Enter destination Directory..." name="destDir' + values[i] + '"' + ' id="destDir' + values[i] + '">');
    			   $(dcontainer).append('<div class="form-group" id="divpatt' + values[i] + '">');
    			   $('#divpatt' + values[i]).append('<label>' + values[i] + ' Destination File Name Pattern</label> <input name="destPatt' + values[i] + '" id="destPatt' + values[i] + '" type="text" class="form-control" value="$XMDM_ORIGINAL_NAME$">');
    		
    			   // Create destination scripts script call check
    			   $(dscrptcont).append('<div class="form-group" id="divscrpt' + values[i] + '">');
    			   $('#divscrpt' + values[i]).append('<label> <input type="checkbox"  class="flat-red" name="callscript' + values[i] + '" id="callscript' + values[i] + '">' + values[i] + '</label>');
    			} 
    		}
            for (i in selected){
            	if(values.indexOf(selected[i]) == -1) {
            		$('#divdir' + selected[i]).remove();
            		$('#divpatt' + selected[i]).remove();
            		$('#divscrpt' + selected[i]).remove();
            	}
            }
        	selected = values;
        }
		

	});
	
	$('#destscripts').on('change', ':checkbox', function(){ 
        var node = $(this).attr('id');
        node = node.replace('callscript', '');
        if ($(this).prop('checked')){
        	// Create destination scri	pts file containers
    		$('#divscrpt' + node).append('<div class="form-group" id="divscrptdir' + node + '">');
    		$('#divscrptdir' + node).append('<label>' + node + ' Script Directory</label><input type="text" class="form-control" placeholder="Enter script directory..." name="scriptdir' + node + '" id="scriptdir' + node + '">');
    		$('#divscrptdir' + node).append('<label>' + node + ' Script Name</label> <input name="scriptname' + node + '" id="scriptname' + node + '" type="text" class="form-control" placeholder="Enter script name and parameters...">');

        } else {
        	// Remove destination scripts file containers
        	$('#divscrptdir' + node).remove();
        }
    });
    
//    $('#interfacetypegrp').on('change', ':checkbox', function(){ 
//        var node = $(this).attr('id');
//        if ((node == 'optionsRadio3' || node == 'optionsRadio4' ) && $(this).prop('checked')){
//        	$('#extcommgrp').show();
//        } else {
//        	$('#extcommgrp').hide();
//        }
//    })
	

	$('#destdata').on('click', ':text', function(){
		var tboxid = String($(this).attr('id'));
		if (tboxid.includes('destPatt')){
			if($('#filenamesample').val() == ''){
				$('#warningtxt').html('Please provide a sample file name in the source section to help you select pattern');
            	$('#modal-warning').modal();
			}else {
			   $('#textBoxid').val(tboxid);
			   $('#modal-info').modal();
			}
		}
    });
    
    	
	/*
   {
   "sourcenode": "SAPBW01",
   "interfaceType": "F2F",
   "codepageconvert": "on",
   "sourfilearchive": "on",
   "archivepath": "/dir/filenam.txt",
   "sourcedirectory": "/com/out/fi",
   "sourcfileinclude": "file$$$.*.txt",
   "sourcfileexclude": "*.zip",
   "filenamesample": "consumer.somthing.txt",
   "destinationnodes": [
      "EDWCDR01",
      "EDWCMA01"
   ],
   "callscriptEDWCDR01": "on",
   "scriptdirEDWCDR01": "/var/script/dir",
   "scriptnameEDWCDR01": "script.ksh",
   "callscriptEDWCMA01": "on",
   "scriptdirEDWCMA01": "/var/dest/script",
   "scriptnameEDWCMA01": "srcript.ksh",
   "destDirEDWCDR01": "/var/wmb/in",
   "destPattEDWCDR01": "$XMDM_ORIGINAL_NAME$",
   "destDirEDWCMA01": "/var/mim/in",
   "destPattEDWCMA01": "$XMDM_ORIGINAL_NAME$",
   "atlregion": "on"
}
   */
	
	var sourceitems = ['sourcenode','sourcedirectory','sourcfileinclude','filenamesample'];
	var destinationitems = ['destinationnodes','sourcedirectory','sourcfileinclude','filenamesample'];
	
	function updateProgressBar(){
		var itemsnbr = 4;
		if($('#sourfilearchive').prop('checked')) itemsnbr = 5;
		var itempercent = 0;
		var destnodes = $('#destinationnodes').val();
		if (destnodes != ""){
			for (i in destnodes) {
				itemsnbr = itemsnbr + 1;
				var destscriptflag = 'callscript' + destnodes[i];
				if( $('input[name="' + destscriptflag + '"]').prop('checked') ) itemsnbr = itemsnbr + 2;
			}
			itempercent = 100/itemsnbr;
		} else {
			itempercent = 50/itemsnbr;
		}
		var value = 0;
	
		if ($('input[name="sourcedirectory"]').val()!='') value = value + itempercent;
		if ($('input[name="sourcedirectory"]').val()!='') value = value + itempercent;
		if ($('input[name="sourcfileinclude"]').val()!='') value = value + itempercent;
		if ($('input[name="filenamesample"]').val()!='') value = value + itempercent;
		if($('#sourfilearchive').prop('checked')){
			if ($('input[name="archivepath"]').val()!='') value = value + itempercent;
		}
		
		if (destnodes != ""){
			for (i in destnodes) {
				var destdirname = 'destDir' + destnodes[i];
        		if ($('input[name="' + destdirname + '"]').val()!='') value = value + itempercent;
           		var destscriptflag = 'callscript' + destnodes[i];
        		if( $('input[name="' + destscriptflag + '"]').prop('checked') ){
        			var scriptdir = 'scriptdir' + destnodes[i];
        			if ($('input[name="' + scriptdir + '"]').val()!='') value = value + itempercent;
            		var scriptname = 'scriptname' + destnodes[i];
        			if ($('input[name="' + scriptname + '"]').val()!='') value = value + itempercent;
        		}
			}
		}
		$('#progressbar').width(Math.ceil(value) + '%')
		$('#progval').html('<b>' + Math.ceil(value) + '</b>/100' );
	}
	
	$('#collapseOne').on('focusout', function (e) {
		updateProgressBar();
	});
	
	$('#collapseTwo').on('focusout', function (e) {
		updateProgressBar();
	});
	
	function checkform(){
		var value = $('#sourcenode').val();
		if (!value) {
			$('#errortxt').html('Please select the source node');
			$('#modal-danger').modal();
			return false;
		}
		if ($('input[name="sourcedirectory"]').val()=='') {
			$('#errortxt').html('Please enter the source node directory');
			$('#modal-danger').modal();
			return false;
		}
		if ($('input[name="sourcfileinclude"]').val()=='') {
			$('#errortxt').html('Please enter the source node file pickup pattern');
			$('#modal-danger').modal();
			return false;
		}
		if ($('input[name="filenamesample"]').val()=='') {
			$('#errortxt').html('Please provide a soucrce file name sample in the Source Node Parameters');
			$('#modal-danger').modal();
			return false;
		}
		if($('#sourfilearchive').prop('checked')){
			if ($('input[name="archivepath"]').val()=='') {
				$('#errortxt').html('Local Archive file is selected. Please provide archive path and file name in the Source Node Parameters');
				$('#modal-danger').modal();
				return false;
			}
		}
		var destnodes = $('#destinationnodes').val();
        if (destnodes == ""){
        	$('#errortxt').html('No destination node has been select');
			$('#modal-danger').modal();
			return false;
        }else {
        	for (i in destnodes) {
        		var destdirname = 'destDir' + destnodes[i];
        		if ($('input[name="' + destdirname + '"]').val()=='') {
        			$('#errortxt').html('Please provide destination directory for destination node: ' + destnodes[i]);
        			$('#modal-danger').modal();
        			return false;
        		}
        		var destscriptflag = 'callscript' + destnodes[i];
        		if( $('input[name="' + destscriptflag + '"]').prop('checked') ){
        			var scriptdir = 'scriptdir' + destnodes[i];
        			if ($('input[name="' + scriptdir + '"]').val()=='') {
            			$('#errortxt').html('Please provide destination script directory for destination node: ' + destnodes[i]);
            			$('#modal-danger').modal();
            			return false;
            		}
        			var scriptname = 'scriptname' + destnodes[i];
        			if ($('input[name="' + scriptname + '"]').val()=='') {
            			$('#errortxt').html('Please provide script name for destination node: ' + destnodes[i]);
            			$('#modal-danger').modal();
            			return false;
            		}
        		}
        	}
        }
		$('#modal-success').modal();
		return true;
	} 
	
    $('#reqform').on('submit', function(evt){
        evt.preventDefault();
		var id = $(document.activeElement).attr('id');
		if(id == "submit") {
			console.log("at submit");
			var action = $(this).attr('action');

			var $container = $(this).closest('.container-fluid');
            if (checkform()){
            	$.ajax({
                    url: action,
                    type: 'POST',
    				data: $(this).serialize(),
                    success: function(data){
                        if(data.success){
                        	$('#filepartarea').hide();
                        	$('#successtxt').html(data.message);
                        	$('#modal-success').modal();
                        } else {
                        	$('#errortxt').html(data.message);
                        	$('#modal-danger').modal();
                        }
                    },
                    error: function(){
                        $container.html('There was a problem.');
                    }
                });
            }
        }
        else {
        	var $container = $(this).closest('.container-fluid');
            if (checkform()){
            	$.ajax({
                    url: 'miminterfacedeploy',
                    type: 'POST',
    				data: $(this).serialize(),
                    success: function(data){
                        if(data.success){
                        	$('#filepartarea').hide();
                        	$('#successtxt').html(data.message);
                        	$('#modal-success').modal();
                        } else {
                        	$('#errortxt').html(data.message);
                        	$('#modal-danger').modal();
                        }
                    },
                    error: function(){
                        $container.html('There was a problem.');
                    }
                });
            }
        }
            
     });
    
    $('#filesearchform').on('submit', function(evt){
        evt.preventDefault();
        var action = $(this).attr('action');
        var $container = $(this).closest('.container-fluid');
        if (checkform()){
        	$.ajax({
                url: action,
                type: 'POST',
				data: $(this).serialize(),
                success: function(data){
                    if(data.success){
                    	$('#successtxt').html(data.message);
                    	$('#modal-success').modal();
                    } else {
                    	$('#errortxt').html(data.message);
                    	$('#modal-danger').modal();
                    }
                },
                error: function(){
                    $container.html('There was a problem.');
                }
            });
        }
    });
    
    var destinatioPatt;

    
    // Modal info event handlers
    $( '#modal-info' ).on('show.bs.modal', function (e) {
    	var sourceboxid = String($('#textBoxid').val());
    	$( '#spattcontainer' ).empty();
    	$( '#sfieldsvalues' ).empty();
    	$( '#fieldbttns' ).empty();
    	$( '#dpattcontainer' ).empty();
    	destinatioPatt = '';
    	var sname = String( $( 'input[name="filenamesample"]' ).val() );
    	var sfields = sname.split( delimiter );
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnsourcefile">Source File Name</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttndot">"."</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttndash">"-"</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnunder">"_"</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnMD">MMDD</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnfulldate">YYYYMMDD</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnfullshortyear">YYMMDD</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttntime">HHMMSS</button>');
    	$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnHM">HHMM</button>');
    	for (i in sfields) {
    		$( '#spattcontainer' ).append('<td><span class="label label-success">Field' + i + '</span></td>');
    		$( '#sfieldsvalues' ).append('<td><span class="label label-success">' + sfields[i] + '</span></td>');
    		$( '#fieldbttns' ).append('<button type="button" class="btn bg-navy btn-flat margin" id="bttnField' + i + '">Field' + i + '</button>');
     	}
   		$( "#destfileName" ).val('$XMDM_ORIGINAL_NAME$');
    });
    
    // Fields buttons events
    $('#patternitems').on('click', ':button', function(){ 
    	var bttnid = String($(this).attr('id'));
    	var pattval = $( "#destfileName" ).val();
    	var fieldval = '';
    	if ( pattval == '$XMDM_ORIGINAL_NAME$') pattval = '';
    	switch (bttnid) {
    		case "anyfieldbttn" :
    			$( "#destfileName" ).val(pattval + $( "#anyfieldval" ).val());
        		fieldval = $( "#anyfieldval" ).val();
    			break;
    		case "clearpatt" :
    			destinatioPatt = '';
    	    	$( '#dpattcontainer' ).empty();
    	    	$( "#destfileName" ).val('');
    			break;
    		case "bttnsourcefile" :
    			$( "#destfileName" ).val($( 'input[name="filenamesample"]' ).val());
    			fieldval = 'filename';
    			break;
    		case "bttndot" :
    			$( "#destfileName" ).val(pattval + '.');
    			fieldval = '.';
    			break;
    		case "bttndash" :
    			$( "#destfileName" ).val(pattval + '-');
    			fieldval = '-';
    			break;
    		case "bttnunder" :
    			$( "#destfileName" ).val(pattval + '_');
    			fieldval = '_';
    			break;
    		case "bttnMD" :
    			$( "#destfileName" ).val(pattval + '0218');
    			fieldval = 'MMDD';
    			break;
    		case "bttnfulldate" :
    			$( "#destfileName" ).val(pattval + '20170824');
    			fieldval = 'YYYYMMDD';
    			break;
    		case "bttnfullshortyear" :
    			$( "#destfileName" ).val(pattval + '170824');
    			fieldval = 'YYMMDD';
    			break;
    		case "bttntime" :
    			$( "#destfileName" ).val(pattval + '094530');
    			fieldval = 'HHMMSS';
    			break;
    		case "bttnHM" :
    			$( "#destfileName" ).val(pattval + '0945');
    			fieldval = 'HHMM';
    			break;
    		default :
    			var sname = String( $( 'input[name="filenamesample"]' ).val() );
        	    var sfields = sname.split( delimiter );
        	    var index = bttnid.replace('bttnField', '');
        	    $( "#destfileName" ).val(pattval + sfields[index]);
    		    fieldval = 'Field' + index;
    	}
    	if (destinatioPatt != '') 
			destinatioPatt = destinatioPatt + ',' + fieldval;
		else
			destinatioPatt = fieldval;
    	$( '#dpattcontainer' ).append('<td><span class="label label-success">' + fieldval + '</span></td>');
     });
    
    $('#savechangesbttn').click( function(){
    	var sourceid = String($('#textBoxid').val());
    	if ( destinatioPatt!='' ) {
    		$( '#' + sourceid ).val(destinatioPatt);
    	    $( dcontainer ).append('<input type="hidden" name="del' + sourceid.replace('destPatt','') + '" value="' + delimiter + '" />');
    	}
    	else {
    		$( sourceid ).val('$XMDM_ORIGINAL_NAME$');
    	}
    	$('#modal-info').modal('hide');
    });
    
    
	$('#filenamesample').bind('input',function() {
		$('#mimintnamediv').empty();
    	var sname = String( $( 'input[name="filenamesample"]' ).val() );
    	var sfields = sname.split( '.');
    	for (i in sfields) {
    		var intname = 'F2F_SOURCE_' + sfields[i].toUpperCase() + '_DESTINATION';
    		if (i==0){
    			$('#mimintnamediv').append('<label> <input type="radio" name="intname" value="' + sfields[i].toUpperCase() + '" class="flat-red" checked> ' + intname + '</label><BR>');
    		}else {
    			if ( i < sfields.length-1 ) 
    				$('#mimintnamediv').append('<label> <input type="radio" name="intname" value="' + sfields[i].toUpperCase() + '" class="flat-red"> ' + intname + '</label><BR>');
    		}
     	}
	});

});