
function kombin(){
  var combs = {};
  var cbs = {};
  for(var prop in arguments[0]){
    combs[prop] = [arguments[0][prop]];
 }
  for(var i=1;i<arguments.length;i++){
    var newCombs = {};
    for(var prop in arguments[i]){
      for(var old in combs){
        var neo = old;
        if(prop) neo+=","
        neo += prop
        newCombs[neo] = combs[old].concat(arguments[i][prop]);
      }
    }
    combs = newCombs;
  }
  for(var old in combs){
	var cb =(function(combs, key){
		
		var cbs = combs[key];
		return function(){
			for(var i=0;i<cbs.length;i++){
				
        console.log(cbs[i]);
        cbs[i]();
			}
		}
	})(combs, old);
	
	combs[old] = cb;
  }   
  return combs;
}

(kombin(
	{
		"a":function(){console.log("a");}, 
		"b":function(){console.log("b");}
	},
	{
		"":function(){console.log("''");}, 
		"2":function(){console.log("2");}
	}
  
)["a"])()
