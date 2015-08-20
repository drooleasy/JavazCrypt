function View(width, height, world, paper){

	this.world = world;
	this.paper = paper;
	this.width = width;
	this.height = height;
	this.transform = new Transform();
	Transform.mixin(this);
	this.lights_on = false;
	this.relative = false;
	this.relative_angle = false;
	this.draw_sight = false;
	
	
	this.lastValidBuffer = document.createElement("canvas");
	this.lastValidBuffer.width=paper.width;
	this.lastValidBuffer.height=paper.height;

}


View.prototype.draw = function draw(){


	// CLEARING
	var ctx = paper.getContext("2d");


	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);
	
	world.player.shadow.clear();	
	world.player.tints.clear();	
	
	ctx.save();

	// TRANSFORMS
	if(this.relative){
	
		ctx.translate(paper.width/2,paper.height/2);	
		if(this.relative_angle) ctx.rotate(-this.world.player.angle-Math.PI/2);
		ctx.translate(-this.world.player.x,-this.world.player.y);	
	}	
	
	// GET LAST RENDERING
	if(this.lastValidBuffer){ 
		var oldCompo = ctx.globalCompositeOperation;
		paper.getContext("2d").drawImage(this.lastValidBuffer,0,0);	
		ctx.globalCompositeOperation = oldCompo;
		
	}

	// DRAWS FOV	
	if(this.draw_sight) this.world.player.drawSight(this.paper, this.world);
	
	// DRAWS OTHERS IF PERCEIVED
	for(var i=0; i< this.world.bobs.length; i++){
		var other = this.world.bobs[i];
		if(other !== this.world.player){
			var sees_bob = this.world.player.sees(other, this.world.allSegments());
			if(!this.lights_on || !this.draw_sight || sees_bob || this.world.player.feels(other)){
				other.draw(this.paper);
			}
		}
	}
	// PLAYERS REACTION
	this.world.player.speak(this.paper, this.world.player, this.relative_angle);
	
	// OTHER ATTENTION
	for(var i=0; i< this.world.bobs.length; i++){
		var other = this.world.bobs[i];
		if(other !== this.world.player){
	
			if(this.world.player.saying || other.feels(this.world.player)){
				var a = clipAngle(
					clipAnglePositive(angleBetween(other.x, other.y, this.world.player.x, this.world.player.y)) - clipAnglePositive(other.angle)
				);
				if(Math.abs(a) > deg2rad(2)) other.angle += deg2rad(2) * Math.abs(a)/a;
			}

			// OTHERS REACTION
			var sees_player = other.sees(this.world.player, this.world.allSegments());
			if(sees_player){
				if(!old_sees_player) other.say(paper, "Hello Bob !");
			}else{
				old_sees_player = false;
			}
			other.speak(this.paper, this.world.player, this.relative_angle);
		}
	}
	
	// DRAWS PLAYER
	this.world.player.draw(this.paper);

	// REVERSE TRANSFORMS
	//if(relative){
	//	ctx.translate(player.x,player.y);
	//	if(relative_angle) ctx.rotate(player.angle-Math.PI/2);
	//	ctx.translate(-paper.width/2,-paper.height/2);	
			
	//}	
	ctx.restore();
	
	// REQUEST NEXT FRAME
	var that = this;
	window.requestAnimationFrame(function(){that.draw()});
}


View.prototype.renderScene = function renderScene(paper, world){

	var all_segments = world.allSegments();

	var slowBuffer = document.createElement("canvas");
	slowBuffer.width = paper.width;
	slowBuffer.height = paper.height;

	var worldRenderer = document.createElement("canvas");
	worldRenderer.width = paper.width;
	worldRenderer.height = paper.height;


	var slowTempoDelay = 1000/30;

	var that = this;
		


	slowTempo = function slowTempo(){
		var ctx = slowBuffer.getContext("2d");
		
		ctx.fillStyle="#000";
		ctx.fillRect(0,0,slowBuffer.width,slowBuffer.height);

		
		var renderedLights = [],
			i=0,
			l=world.lights.length,
			n=l+1;
		
		
		function drawScene(ctx, nofill){
			// DRAWS SCENE
			ctx.fillStyle = "#333";
			ctx.strokeStyle = "#cfc";
			if(nofill) ctx.fillStyle = "rgba(0,0,0,0)";
			ctx.lineWidth = 4;
			for(var i=0;i<that.world.paths.length;i++){
				ctx.beginPath();
				that.world.paths[i].draw(worldRenderer, false);
				if(!nofill) ctx.fill();
				ctx.stroke();
			}
			ctx.fillStyle = "#000";
			for(var i=0;i<that.world.boulders.length;i++){


				ctx.beginPath();
				that.world.boulders[i].draw(worldRenderer, true);
				if(!nofill) ctx.fill();
				ctx.stroke();
			}
			for(var i=0; i< that.world.segments.length;i++){
				ctx.strokeStyle = "#cfc";
				if(world.segments[i] instanceof Glass) ctx.strokeStyle="rgba(255,255,255, 0.3)" 
				if(world.segments[i] instanceof Door) ctx.strokeStyle="#cc6" 
				ctx.beginPath();
				that.world.segments[i].draw(worldRenderer);
				ctx.stroke();
			}
		}
		
		function conclude(){
			
			var ctx = slowBuffer.getContext("2d");
			var wctx = worldRenderer.getContext("2d");


			if(that.lights_on){

				wctx.globalCompositeOperation = "luminosity";
				wctx.drawImage(slowBuffer,0,0);

				// re draw wall 
				wctx.globalCompositeOperation = "source-over";
				drawScene(wctx, true);

			}
			that.lastValidBuffer.getContext("2d").putImageData(wctx.getImageData(0,0,worldRenderer.width, worldRenderer.height), 0, 0);
			setTimeout(slowTempo, slowTempoDelay);
		}
		
		
		setTimeout(function(){
			var ctx = worldRenderer.getContext("2d");
			ctx.globalCompositeOperation = "source-over";
			
			ctx.fillStyle="#393";
			ctx.fillRect(0,0,worldRenderer.width,worldRenderer.height);
			drawScene(ctx);

			n--;
			if(n==0){
				conclude();
			}
		},0);
		
		for(i=0;i<l;i++){
			setTimeout(
				(function(a_light){
					return function(){
						a_light.draw(slowBuffer, world.allSegments(), world.bobs);
						n--;
						if(n==0){
							conclude();
						}
						
					};
				})(world.lights[i]),
			0)
		}
	}


	setTimeout(slowTempo, slowTempoDelay);
}


