
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

}

Light.defaults = {
	x:0,
	y:0,
	positionVariation : 2,
	
	angle: 0,
	
	sightWidth: PIPI,
	sightLength: 200,
	
	startDecay : 0.333,
	decayVariation : 0.1,
	
	lineWidth:1,
	lineColor : "#000",
	
	lightColor : "rgba(48,144,48,1)",
	shadowColor : "rgba(0,0,0,1)",
	
	
	lightComposite : "lighten",
	shadowComposite : "hard-light"

};

Light.prototype.moveTo = function(pos){
	this._x = pos.x;
	this._y = pos.y;
}

		
Light.prototype.draw = function(paper, path, boulder, bobs){		
	var ctx = paper.getContext('2d');

	this.x = this._x + randomDelta(this.positionVariation);
	this.y = this._y + randomDelta(this.positionVariation);
	var that = this;


	this.shadow.clear();

	// WORLD SHADOWS
	for(i=0;i<path.segments.length;i++){
		path.segments[i].castShadow(this);
	}
	for(i=0;i<boulder.segments.length;i++){
		boulder.segments[i].castShadow(this);
	}
	
	// OTHERS SHADOWS	
	for(i=0;i<bobs.length;i++){
		var bob = bobs[i];
		if(bob != this.belongsTo){
			var sees_bob = bob && distanceBetween(this.x, this.y, bob.x, bob.y) < this.sightLength+bob.width;
			if(sees_bob){
				bob.castShadow(this);
			}
		}
	}
	var oldCompositeOperation = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = this.lightComposite;
	
	var grd=ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.sightLength);
	grd.addColorStop(0, this.lightColor);
	grd.addColorStop(this.startDecay + randomDelta(this.decayVariation), this.lightColor);
	grd.addColorStop(1, this.shadowColor);
	
	ctx.fillStyle = grd;			
	ctx.lineWidth = this.lineWidth;
	ctx.beginPath();


	ctx.moveTo(this.x, this.y);
	ctx.arc(this.x, this.y, this.sightLength, 0, this.sightWidth);

	ctx.closePath();
	ctx.stroke();
	ctx.fill();

	ctx.globalCompositeOperation = this.shadowComposite;

	this.shadow.draw(paper);
		
	ctx.globalCompositeOperation = oldCompositeOperation;

}
