function View(width, height, world, paper){

	this.width = width;
	this.height = height;
	this.transform = new Transform();
	Transform.mixin(this);
}


View.prototype.draw = function draw(){


	// CLEARING
	var ctx = paper.getContext("2d");


	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);
	
	player.shadow.clear();	
	player.tints.clear();	
	
	ctx.save();

	// TRANSFORMS
	if(relative){
	
		ctx.translate(paper.width/2,paper.height/2);	
		if(relative_angle) ctx.rotate(-player.angle-Math.PI/2);
		ctx.translate(-player.x,-player.y);	
	}	
	
	// GET LAST RENDERING
	if(renderScene.lastValidBuffer){ 
		var oldCompo = ctx.globalCompositeOperation;
		paper.getContext("2d").drawImage(renderScene.lastValidBuffer,0,0);	
		ctx.globalCompositeOperation = oldCompo;
		
	}

	// DRAWS FOV	
	if(draw_sight) world.player.drawSight(paper, world);
	
	// DRAWS OTHERS IF PERCEIVED
	for(var i=0; i< world.bobs.length; i++){
		var other = world.bobs[i];
		if(other !== world.player){
			var sees_bob = world.player.sees(other, world.allSegments());
			if(!lights_on || !draw_sight || sees_bob || player.feels(other)){
				other.draw(paper);
			}
		}
	}
	// PLAYERS REACTION
	player.speak(paper, world.player, relative_angle);
	
	// OTHER ATTENTION
	for(var i=0; i< world.bobs.length; i++){
		var other = world.bobs[i];
		if(other !== world.player){
	
			if(world.player.saying || other.feels(player)){
				var a = clipAngle(
					clipAnglePositive(angleBetween(other.x, other.y, player.x, player.y)) - clipAnglePositive(other.angle)
				);
				if(Math.abs(a) > deg2rad(2)) other.angle += deg2rad(2) * Math.abs(a)/a;
			}

			// OTHERS REACTION
			var sees_player = other.sees(world.player, world.allSegments());
			if(sees_player){
				if(!old_sees_player) other.say(paper, "Hello Bob !");
			}else{
				old_sees_player = false;
			}
			other.speak(paper, player, relative_angle);
		}
	}
	
	// DRAWS PLAYER
	world.player.draw(paper);

	// REVERSE TRANSFORMS
	//if(relative){
	//	ctx.translate(player.x,player.y);
	//	if(relative_angle) ctx.rotate(player.angle-Math.PI/2);
	//	ctx.translate(-paper.width/2,-paper.height/2);	
			
	//}	
	ctx.restore();
	
	// REQUEST NEXT FRAME
	window.requestAnimationFrame(draw);
}
