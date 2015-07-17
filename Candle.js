function Candle(x,y,r){
	this._x = x;
	this.x = x;
	this._y = y;
	this.y = y;
	this.sightLength = r;
	this.shadow = new Shadow();
	this.shadow.style["fill-opacity"] = 0.5;
	this.angle = 0;
	
	var that = this;
	setInterval(function(){
		that.x = that._x + Math.random()*4 -2;
		that.y = that._y + Math.random()*4 -2;
	}, 1000/8)
}

Candle.prototype.sees = function(bob){
	var metrics = distanceAndAngle(this.x, this.y, bob.x, bob.y);
	if(metrics.distance < this.sightLength) return true;
	else return false;
}




Candle.prototype.draw = function(paper){
	paper.path(circle(this.x, this.y, 3, 0)).attr({fill:"#fff"}); 
}


Candle.prototype.fovSegments = function(){

		return {
			left:new Segment(this.x, this.y, this.x-this.sightLength, this.y),
			right:new Segment(this.x, this.y, this.x+this.sightLength, this.y),
		}
	
}


Candle.prototype.drawShadow = function(paper){
	this.shadow.draw(paper);
}
