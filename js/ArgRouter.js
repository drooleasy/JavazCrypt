window = window || this;

function is_numeric(n){
	return !isNaN(parseFloat(n)) && isFinite(n);	
}


function parseSignature(signature){
	signature = signature.replace(/\(|\)|\s+/gmi, "");
	var typesRaw = signature.split(","),
		types = [];
	
	for(var i=0; i<typesRaw.length; i++){
		var type = typesRaw[i];
		////console.log("add type : " + type)
		if(type != "") types.push(type); 
	}
	return types;
}

function parseType(t){

	var props = t.split(/\./gmi)
	t=props[0];
	
	var prop_condition = function(o){
		for(var i=1; i<props.length; i++){
			var prop = props[i];
			if(o[prop] == null || o[prop] == undefined){
				return false;
			}
		};
		return true;
		
	};


	var type_condition = null;
	if(t=="fun") type_condition = function(v){return typeof v == "function"}
	else if(t=="num") type_condition = function(v){return typeof v == "number"}
	else if(t=="str") type_condition = function(v){return typeof v == "string"}
	else if(t=="bool") type_condition = function(v){return typeof v == "boolean"}
	else if(t=="obj") type_condition = function(v){return typeof v == "object"}
	else if(t=="arr") type_condition = function(v){return is_numeric(v.length)}
	else type_condition = function(v){return v instanceof window[t]}
	
	
	return function(v){
		return type_condition(v) && prop_condition(v);
	}
}


function ArgRouter(_that){
	var signatures = [];
	var callbacks = [];
	this.that = function(){return _that};
	this.add = function(signature, callback){
		//console.log("adding " + signature)
		var next = this.length();
		signatures[next] = parseSignature(signature);
		callbacks[next] = callback;
	};
	this.rule = function(i){
		if(i<0 || i>=this.length) throw new Error("out of bounds")
		//console.log("rule #"+i);
		//console.log(signatures[i]);
		return {
			signature:signatures[i],
			callback:callbacks[i],
		}
	};
	this.length = function(){
		return signatures.length;
	};
}

ArgRouter.prototype.testRule = function(args, rule_num){
		var types = this.rule(rule_num).signature,
			i=0;
		//console.log("test rule");
		//console.log(types);
		if(args.length != types.length) return false;
		for(;i<types.length;i++){
			//console.log("checking " + types[i])
			var check = parseType(types[i]);
			if(!check(args[i])){
				 //console.log("...failed");
				 return false;
			}
		}
		return true;
}

ArgRouter.prototype.route = function(args){
	for(var i=0; i<this.length(); i++){
		//console.log("routing " + i)
		//console.log(this.rule(i).signature)
		if(this.testRule(args, i)){
			this.rule(i).callback.apply(this.that(), args);
			return true;
		}
	}
	return false;
}


function test(){
	var router = new ArgRouter(this);
	router.add("()", function(){console.log("empty args")})
	router.add("(num)", function(){console.log("one num")})
	router.add("(num,num)", function(){console.log("two num")})
	router.add("(num, obj)", function(){console.log("one num and one obj")})
	router.add("(num,num, obj)", function(){console.log("two num and one obj")})
	router.add("(num,num, arr)", function(){console.log("two num and one obj")})
	
	if(!router.route(arguments)){
		console.log("no route found")
	}
}



