function testCombine(){
		var ctx = {};
		var router = new ArgRouter(ctx);
		var hash1 = {
			"num":function(num){
				console.log("num " + num); 
			},
			"bool,bool":function(b,b2){
				console.log("bool " + b);
				console.log("bool " + b2);
			}
		}
		var hash2 = {
			"arr":function(arr){
				console.log("arr " + arr); 
			},
			"obj":function(o){
				console.log("o " + o); 
			}
		}
		
		var hash3 = {
			"":function(){
				console.log("no arg cb"); 
			},
			"num":function(num){
				console.log("num " + num); 
			}
		}

		router.combine(hash1, hash2, hash3);
		if(!router.route(arguments)) console.log("no route found")
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
