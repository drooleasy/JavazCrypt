
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
		//////console.log("add type : " + type)
		if(type != "") types.push(type); 
	}
	return types;
}


ArgRouter.Route = function ArgRouterRoute(signature, callback){
	this.signature = signature
	this.parameters = ArgRouter.parseSignature(signature);
	this.callback = callback;

	var argValidate = [];
	
	for(var i=0; i<this.parameters.length; i++){
		argValidate[i] = ArgRouter.parseType(this.parameters[i]);
	}
	
	this.validate = validate = function validateRoute(args){
		var i=0;
		for(; i<args.length; i++){

			//console.log("validating parameter #" + i + " of " +  this.signature)
			//console.log("...against " + args[i])
			if(!(argValidate[i](args[i]))){ 
				//console.log("...failed");
				return false;
			}else{
				//console.log("...passed");
			}
		}
		return true
	}		
}

ArgRouter.parseType = function (t){

	var props = t.split(/\./gmi)
	t=props[0];
		var prop_condition = null;
	if(props.length > 1){
	prop_condition = function testProperties(v, t){
			for(var i=1; i<props.length; i++){
				var prop = props[i];
				if(v[prop] == null || v[prop] == undefined){
					return false;
				}
			};
			return true;
			
		};
	}



	if(!t) return function testNoParameter(v){ 
		//console.log("test no param"); 
		return v === undefined
	};

	var type_condition = null;
	if(t=="any") type_condition = ArgRouter.testAnyParameter;
	else if(t=="fun") type_condition = ArgRouter.testFunParameter;
	else if(t=="num") type_condition = ArgRouter.testNumParameter;
	else if(t=="str") type_condition = ArgRouter.testStrParameter;
	else if(t=="bool") type_condition = ArgRouter.testBoolParameter;
	else if(t=="obj") type_condition = ArgRouter.testObjParameter;
	else if(t=="arr") type_condition = ArgRouter.testArrParameter;
	else type_condition = ArgRouter.testCustomTypeParameter;
	
	
	return function testParameter(v){
		return type_condition(v, t) && (!prop_condition || prop_condition(v, t));
	}
}


ArgRouter.testAnyParameter = function testAnyParameter(v, t){return true}
ArgRouter.testFunParameter = function testFunParameter(v, t){return typeof v == "function"}
ArgRouter.testNumParameter = function testNumParameter(v, t){return typeof v == "number"}
ArgRouter.testStrParameter = function testStrParameter(v, t){return typeof v == "string"}
ArgRouter.testBoolParameter = function testBoolParameter(v, t){return typeof v == "boolean"}
ArgRouter.testObjParameter = function testObjParameter(v, t){return typeof v == "object"}
ArgRouter.testArrParameter = function testArrParameter(v, t){return ArgRouter.is_numeric(v.length)}
ArgRouter.testCustomTypeParameter = function testCustomTypeParameter(v, t){return v instanceof window[t]}


function ArgRouter(){
	var routes = [];
	var route_length_index = [];
	this.add = function addRoute(signature, callback){
		////console.log("adding " + signature)	
		var next = this.length();
		
		
		var newroute = new ArgRouter.Route(signature, callback);
		
		routes[next] = newroute;
		
		var num_param = newroute.parameters.length
		if(!route_length_index[num_param]) route_length_index[num_param] = [];
		route_length_index[num_param].push(next);
	};
	this.getRoute = function getRoute(i){
		if(i<0 || i>=this.length) throw new Error("out of bounds")
		return routes[i];
	};
	this.getCandidates = function getCandidates(num_args){
		var res = [];
		for(var i=num_args; i<route_length_index.length; i++){
			if(route_length_index[i]) res = res.concat(route_length_index[i]);
		}
		return res;
	}

	this.length = function length(){
		return routes.length;
	};
}

ArgRouter.prototype.route = function(ctx, args){
	ctx = ctx || {};
	var l = args.length
	var possibles = this.getCandidates(l);
	//console.log("__routing__")
	for(var i=0; i<possibles.length; i++){
		var rule_index = possibles[i],
			a_route = this.getRoute(rule_index);
			
		//console.log("test route " + a_route.signature)
		if(a_route.validate(args)){
			//console.log("...succeed")
			a_route.callback.apply(ctx, args);
			return true;
		}else{
			//console.log("...failed")
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
		var subsignatures_length = [];
		for(var i=0;i<cbs_args.length;i++){
			var subsignature = ArgRouter.parseSignature(cbs_args[i]);
			subsignatures_length.push(subsignature.length)
		}
		return function(){
			var argdex = -1;
			for(var i=0;i<cbs_args.length;i++){
				var sub_length = subsignatures_length[i];
				var arg = [];
				for(j=0; j<sub_length; j++){
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
		////console.log("add " + old);
		this.add(old, combs[old]);
	}
   
  //return combs;
}

