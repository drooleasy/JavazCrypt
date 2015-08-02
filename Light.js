
function Light (x, y, sightLength, sightWidth, angle){
	this.x  = x || Light.defaults.x;
	this._x = x || Light.defaults.x;
	this.y  = y || Light.defaults.y;
	this._y = y || Light.defaults.y;
	this.positionVariation = Light.defaults.positionVariation;
	this.angle = angle || Light.defaults.angle;


	this.sightLength = sightLength || Light.defaults.sightLength;
	this.sightWidth = sightWidth || Light.defaults.sightWidth;
	
	this.lightComposite = Light.defaults.lightComposite;
	this.shadowComposite = Light.defaults.shadowComposite;
	
	this.lineWidth = Light.defaults.lineWidth;
	this.lineColor = Light.defaults.lineColor;

	this.lightColor = Light.defaults.lightColor;
	this.shadowColor = Light.defaults.shadowColor;
	
	this.startDecay = Light.defaults.startDecay;
	this.decayVariation = Light.defaults.decayVariation;

	this.shadow = new Shadow();

	this.belongsTo = null;
	
	this.renderer = document.createElement("canvas");
	this.renderer.width = this.sightLength *2;
	this.renderer.height = this.sightLength *2;

}

Light.defaults = {
	x:0,
	y:0,
	positionVariation : 2,
	
	angle: 0,
	
	sightWidth: PIPI,
	sightLength: 200,
	
	startDecay : 0.1,
	decayVariation : 0.1,
	
	lineWidth:1,
	lineColor : "#000",
	
	//lightColor : "rgba(48,144,48,1)",
	lightColor : "#303030",
	shadowColor : "rgba(0,0,0,1)",
	
	
	lightComposite : "multiply",
	shadowComposite : "source-over"

};

Light.prototype.moveTo = function(pos){
	this._x = pos.x;
	this._y = pos.y;
}

		
Light.prototype.draw = function(paper, path, boulder, bobs, segments){		
	

	this.renderer.width = paper.width;
	this.renderer.height = paper.height;

	var ctx = this.renderer.getContext('2d');

	this.x = this._x + randomDelta(this.positionVariation);
	this.y = this._y + randomDelta(this.positionVariation);

	var that = this;


	this.shadow.clear();

	// WORLD SHADOWS
	if(path) for(i=0;i<path.segments.length;i++){
		path.segments[i].castShadow(this);
	}
	if(boulder) for(i=0;i<boulder.segments.length;i++){
		boulder.segments[i].castShadow(this);
	}
	
	// OTHERS SHADOWS	
	if(bobs) for(i=0;i<bobs.length;i++){
		var bob = bobs[i];
		var d = distanceBetween(this.x, this.y, bob.x, bob.y);
		if(
			d > bob.width
		){
			var sees_bob = bob && d < this.sightLength+bob.width;
			if(sees_bob){
				bob.castShadow(this);
			}
		}else{
			bob.castOverShadow(this);			
		}
	}
	
	if(segments){
		for(i=0;i<segments.length;i++){
			var segment = segments[i];
			segment.castShadow(this);
		}
	}
	


	var oldCompositeOperation = ctx.globalCompositeOperation;



	ctx.beginPath();
	ctx.fillStyle="#000";
	ctx.fillRect(0,0, ctx.width, ctx.height);
	ctx.closePath();



	ctx.fillStyle="#FFF"
	ctx.strokeStyle="#000"
	ctx.save();
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.sightLength, 0, this.sightWidth);
	ctx.fill();
	ctx.stroke();
	ctx.clip()

	ctx.fillStyle="#000";
	
	ctx.globalCompositeOperation = this.shadowComposite;
	this.shadow.draw(this.renderer);
	ctx.fill();
	
	ctx.globalCompositeOperation = "darken";
	
	var grd=ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.sightLength);
	grd.addColorStop(0, this.lightColor);
	grd.addColorStop(this.startDecay + randomDelta(this.decayVariation), this.lightColor);
	grd.addColorStop(1, this.shadowColor);
	
	ctx.fillStyle = grd;			
	ctx.lineWidth = this.lineWidth;
	ctx.beginPath();
	ctx.fillRect(0,0,this.renderer.width,this.renderer.height);

	ctx.globalCompositeOperation = "source-over";
	
	ctx.strokeStyle="#000";
	ctx.lineWidth = "6"
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.sightLength, 0, this.sightWidth);
	ctx.closePath();
	ctx.stroke();


	ctx.globalCompositeoperation="source-over";
	ctx.fillStyle="#999";
	ctx.beginPath();
	ctx.arc(this.x, this.y, 2+Math.random()*2-1, 0, Math.PI*2)
	ctx.fill();
	ctx.globalCompositeOperation = oldCompositeOperation;
	
	
	ctx.restore();
	
	var pctx = paper.getContext("2d");
	oldCompositeOperation = pctx.globalCompositeOperation;
	pctx.globalCompositeOperation = "lighter";
	pctx.drawImage(this.renderer,0,0);
	pctx.globalCompositeOperation = oldCompositeOperation;
	

}
