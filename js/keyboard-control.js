function keyboardControl(item){
	
	var controlled = item;
	
	var keysCB = {
		"37" : "turnLeft",
		"39" : "turnRight",
		"38" : "moveForward",
		"40" : "moveBackward"
	};
	
	var keys = {};
	$("body").keydown(function(evt){
		keys[evt.which] = true
	});
	$("body").keyup(function(evt){
		delete keys[evt.which];
	});

	

	setInterval(function(){				
		for(key in keysCB){
			if(keys[parseInt(key)]) controlled[keysCB[key]]();	
		}
		
	}, 1000/60);
}

