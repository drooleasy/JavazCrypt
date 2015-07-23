
function Light (x,y,sightLength){
	this._x = x;
	this.x = x;
	this._y = y;
	this.y = y;
	this.shadow = new Shadow();
	this.sightLength = sightLength; // cheeta
	this.angle = 0; // dummy see segment cast shadow
}

Light.prototype.moveTo = function(pos){
	this._x = pos.x;
	this._y = pos.y;
}

		
Light.prototype.draw = function(paper, path, boulder, bob){		
	var ctx = paper.getContext('2d');


	this.x = this._x+Math.random()*4-2;
	this.y = this._y+Math.random()*4-2;
	var that = this;

	// WORLD SHADOWS
	for(i=0;i<path.segments.length;i++){
		path.segments[i].castShadow(this);
	}
	for(i=0;i<boulder.segments.length;i++){
		boulder.segments[i].castShadow(this);
	}

	// OTHERS SHADOWS
	var sees_bob = bob && distanceAndAngle(this.x, this.y, bob.x, bob.y).distance < this.sightLength+bob.width;
	if(sees_bob){
		bob.castShadow(this);
	}
	

	var oldCompositeOpration = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = "lighten";
	var grd=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.sightLength);
	grd.addColorStop(0,"rgba(48,144,48,1)");
	grd.addColorStop(0.333 + Math.random()*0.1-0.05,"rgba(48,144,48,1)");
	grd.addColorStop(1,"rgba(0,0,0,1)");

	ctx.fillStyle = grd;
			
	ctx.lineWidth = 1;

	ctx.beginPath();

	ctx.moveTo(this.x, this.y);
	ctx.arc(this.x, this.y, this.sightLength, 0, 2*Math.PI);

	ctx.closePath();
	ctx.stroke();
	ctx.fill();

	ctx.globalCompositeOperation = "hard-light";

	this.shadow.draw(paper);
		
	ctx.globalCompositeOperation = oldCompositeOpration;

}
