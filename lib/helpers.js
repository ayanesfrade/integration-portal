exports.jsonstring = function (json) {
    return JSON.stringify(json);
};


exports.compare = function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

exports.pickColor = function(status) {
	  switch(status) {
	      case "completed":
	          return "green";
	          break;
	      case "in progress":
	          return "yellow";
	          break;
	      case "pending":
	          return "red";
	          break;
	  };
};

exports.selected = function(value,option){
	if (value == option) 
		return "selected"; 
	else return "";
}

exports.ifEqual = function (obj, value, trueString, falseString) {
    return ( (obj===value) ? trueString : falseString );
}