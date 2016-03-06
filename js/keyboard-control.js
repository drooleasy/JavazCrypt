/**
 * set keyboard control for the world
 * @param {World} world the world to be controlled
 */
function keyboardControl(world){
	
	var controlled = world.player;
	
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
		
		var player = controlled;
		// COLLISIONS
		var p_aabb = player.AABB(1);
		(function collision_tests(){ // iife for profiling segmentation purpose
			for(var i=0;i<world.bobs.length;i++){
				if(world.bobs[i] !== world.player) world.player.collidesWithBob(world.bobs[i]);
			}
			var all_segments = world.allSegments();
			for(var i=0; i<all_segments.length;i++){
				var segment = all_segments[i];
				var s_aabb = segment.AABB(1);
				if(!p_aabb.intersects(s_aabb)) continue;	
				player.collidesWithSegment(segment);
			}
		})();
		
		var all_segments= world.allSegments();
		
		(function doors_tests(){ // iife for profiling segmentation purpose
		
			// DOORS OPENING/CLOSING
			for(i=0;i<all_segments.length;i++){
				var segment = all_segments[i]; 
				
				if(segment instanceof Door) {
					var door = segment;
					var d_aabb = door.AABB(1.5);
					// problem with segment AABB when vertical
					//if(!p_aabb.intersects(d_aabb)){ 
					//	door.close();
					//	continue;	
					//}
					var closest = segment.closestPointFrom(world.player.x, world.player.y);
					var d = distanceBetween(closest.x, closest.y, world.player.x, world.player.y)
					if(d<world.player.width + door.detectionDistance){
						door.open();
					}else{
						door.close();
					}
				}
			}
		})();

		
	}, 1000/60);
}

