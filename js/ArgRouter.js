
window = window || this;

ArgRouter.is_numeric = function (n){
	return !isNaN(parseFloat(n)) && isFinite(n);	
}


ArgRouter.parseSignature = function (signature){
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

ArgRouter.parseType = function (t){

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
	else if(t=="arr") type_condition = function(v){return ArgRouter.is_numeric(v.length)}
	else type_condition = function(v){return v instanceof window[t]}
	
	
	return function(v){
		return type_condition(v) && prop_condition(v);
	}
}


function ArgRouter(){
	var signatures = [];
	var callbacks = [];
	this.add = function(signature, callback){
		//console.log("adding " + signature)
		var next = this.length();
		signatures[next] = ArgRouter.parseSignature(signature);
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
			var check = ArgRouter.parseType(types[i]);
			if(!check(args[i])){
				 //console.log("...failed");
				 return false;
			}
		}
		return true;
}

ArgRouter.prototype.route = function(ctx, args){
	ctx = ctx || {};
	for(var i=0; i<this.length(); i++){
		//console.log("routing " + i)
		//console.log(this.rule(i).signature)
		if(this.testRule(args, i)){
			this.rule(i).callback.apply(ctx, args);
			return true;
		}
	}
	return false;
}

ArgRouter.prototype.combine = function(/* hash... */){
  var combs = {};
  var combs_args = {};
  for(var prop in arguments[0]){
    combs[prop] = [arguments[0][prop]];
    combs_args[prop] = [prop];
 }
  for(var i=1;i<arguments.length;i++){
    var newCombs = {};
    var newCombs_args = {};
    for(var prop in arguments[i]){
		  for(var old in combs){
				var neo = old;
				if(prop) neo+=","
				neo += prop
				newCombs[neo] = combs[old].concat(arguments[i][prop]);
				newCombs_args[neo] = combs_args[old].concat([prop]);
		  }
    }
    combs = newCombs;
    combs_args = newCombs_args;
  }
  for(var old in combs){
	var cb =(function(combs, key){
		
		var cbs = combs[key];
		var cbs_args = combs_args[key];
		return function(){
			var argdex = -1;
			for(var i=0;i<cbs_args.length;i++){
				var signature = ArgRouter.parseSignature(cbs_args[i]);
				var arg = [];
				for(j=0; j<signature.length; j++){
					argdex++;
					arg.push(arguments[argdex])
				}	
				cbs[i].apply(this, arg);
			}
		}
	})(combs, old);
	combs[old] = cb
  }
  
  
	for(var old in combs){
		//console.log("add " + old);
		this.add(old, combs[old]);
	}
   
  //return combs;
}

