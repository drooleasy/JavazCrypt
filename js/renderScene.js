/**
 * render a world on canvas and set up rendering timeouts
 * @param {object} paper a canvas dom element
 * @param {World} the world object
 */
function renderScene(paper, world){

	var all_segments = world.allSegments();

	var slowBuffer = document.createElement("canvas");
	slowBuffer.width = paper.width;
	slowBuffer.height = paper.height;

	var worldRenderer = document.createElement("canvas");
	worldRenderer.width = paper.width;
	worldRenderer.height = paper.height;


	var slowTempoDelay = 1000/30;



	renderScene.lastValidBuffer= document.createElement("canvas");
	renderScene.lastValidBuffer.width=paper.width;
	renderScene.lastValidBuffer.height=paper.height;


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
			ctx.beginPath();
			path.draw(worldRenderer, false);
			if(!nofill) ctx.fill();
			ctx.stroke();
			
			ctx.fillStyle = "#000";
			ctx.beginPath();
			boulder.draw(worldRenderer, true);
			if(!nofill) ctx.fill();
			ctx.stroke();

			for(var i=0; i< all_segments.length;i++){
				ctx.strokeStyle = "#cfc";
				if(all_segments[i] instanceof Glass) ctx.strokeStyle="rgba(255,255,255, 0.3)" 
				if(all_segments[i] instanceof Door) ctx.strokeStyle="#cc6" 
				ctx.beginPath();
				all_segments[i].draw(worldRenderer);
				ctx.stroke();
			}
		}
		function conclude(){
			
			var ctx = slowBuffer.getContext("2d");
			var wctx = worldRenderer.getContext("2d");

			if(lights_on){

				wctx.globalCompositeOperation = "luminosity";
				wctx.drawImage(slowBuffer,0,0);

				// re draw wall 
				wctx.globalCompositeOperation = "source-over";
				drawScene(wctx, true);

			}
			renderScene.lastValidBuffer.getContext("2d").putImageData(wctx.getImageData(0,0,worldRenderer.width, worldRenderer.height), 0, 0);
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
						a_light.draw(slowBuffer, all_segments, world.bobs);
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
