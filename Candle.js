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
	if(false)setInterval(function(){
		that.x = that._x + Math.random()*4 -2;
		that.y = that._y + Math.random()*4 -2;
	}, 1000/8)
}


Candle.prototype.drawHalo = function(offcanvas, w, h) {
	
	function randHex(minimum, variable){
		var res = (minimum + Math.floor(Math.random()*variable)).toString(16);
		if(res.length<2) rrs = "0" + res;
		return res; 
	}

	var offctx = offcanvas.getContext('2d');

	var color = "#"
		+ randHex(239, 16)
		+ randHex(239, 16)
		+ randHex(144, 32)
		
	var x = this.x + Math.random()*4-2,
		y = this.y  + Math.random()*4-2,
		r = 10 + Math.random()*6-3,
		r2 = this.sightLength + Math.random()*20-10,
		grd=offctx.createRadialGradient(x, y, r, x, y, r2);
	grd.addColorStop(0,color);
	grd.addColorStop(.99,"#010101");
	grd.addColorStop(1,"#000");

	// Fill with gradient
	offctx.fillStyle=grd;
	offctx.fillRect(0, 0, w, h);	

}			



