/**
 * viewport for a world
 * @constructor
 * @param {number} width the width of the view
 * @param {number} height the height of the view
 * @param {World} world the world data
 * @param {object} paper the canvas to draw on
 */
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

/**
 * draw the fully illuminated world on its canvas, manage interactions and reactions
 */
View.prototype.draw = function draw(){


	// CLEARING
	var ctx = paper.getContext("2d");


	// erase paper
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, paper_width, paper_height);

	// empty shadows and tints
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

/**
 * renders the world on canvas using a slow tempo for light and shadow rendering
 * @param {object} paper the canvas dom element
 * @param {World} world the world to render
 */
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

		// erase
		ctx.globalCompositeOperation = "source-over";

		ctx.fillStyle="#000";
		ctx.fillRect(0,0,slowBuffer.width,slowBuffer.height);


		var renderedLights = [],
			i=0,
			l=world.lights.length,
			n=l+1;

		// draw fully illuminated scene
		function drawScene(ctx, nofill){
			// DRAWS SCENE
			ctx.lineWidth = 8;
			// paths
			for(var i=0;i<that.world.paths.length;i++){
				ctx.beginPath();
				//if(i==0) ctx.fillStyle = "#393";
				that.world.paths[i].draw(worldRenderer, false);
				ctx.stroke();
			}
			ctx.fillStyle = "#000";
			// boulders
			for(var i=0;i<that.world.boulders.length;i++){
				ctx.beginPath();
				that.world.boulders[i].draw(worldRenderer, true);
				ctx.stroke();
			}
			// segment (door, glass)
			for(var i=0; i< that.world.segments.length;i++){

				ctx.beginPath();
				that.world.segments[i].draw(worldRenderer);
				ctx.stroke();
			}
		}// en draw scene

		// draw fully illuminated scene
		function drawSceneTextures(ctx){
			// DRAWS SCENE
			ctx.strokeStyle = "transparent";
			ctx.lineWidth = 0;
			// paths
			for(var i=0;i<that.world.floors.length;i++){
				var path = that.world.floors[i];
				//if(i==0) ctx.fillStyle = "#393";

				path.draw(worldRenderer);

			}

			// boulders

		}// en draw scene textures

		function conclude(){

			// lights and shadow
			var ctx = slowBuffer.getContext("2d");

			// fully illuminated world
			var wctx = worldRenderer.getContext("2d");


			if(that.lights_on){

				//wctx.globalCompositeOperation = "luminosity";
				wctx.globalCompositeOperation = "multiply";
				//wctx.globalCompositeOperation = "source-over";
				wctx.drawImage(slowBuffer,0,0);


			}
			// re draw wall
			wctx.globalCompositeOperation = "source-over";
			drawScene(wctx);
			that.lastValidBuffer.getContext("2d").putImageData(wctx.getImageData(0,0,worldRenderer.width, worldRenderer.height), 0, 0);
			setTimeout(slowTempo, slowTempoDelay);
		}


		setTimeout(function(){
			var ctx = worldRenderer.getContext("2d");
			ctx.globalCompositeOperation = "source-over";

			// erase fully illuminated
			//ctx.fillStyle="#393";

			//ctx.fillRect(0,0,worldRenderer.width,worldRenderer.height);




			// redraws it
			drawSceneTextures(ctx);

			// virtual light task
			n--;
			if(n==0){ // if no more task merge world and lights
				conclude();
			}
		},0);

		//console.log(slowBuffer.getContext('2d').globalCompositeOperation);
		slowBuffer.getContext('2d').globalCompositeOperation = "screen";
		//draw lights
		for(i=0;i<l;i++){
			setTimeout( // dont freeze ui
				(function(a_light){
					return function(){
						a_light.draw(slowBuffer, world.allSegments(), world.bobs);
						n--; // task done
						if(n==0){ // if no more lights to compute, merge world and lights
							conclude();
						}

					};
				})(world.lights[i]),
			0)
		}
	} // end slow temp


	setTimeout(slowTempo, slowTempoDelay);
}
