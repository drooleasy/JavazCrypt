
function Path (/*x,y,...*/){
	var i = 0,
		l = arguments.length;
	this.points = [];
	
	for(;i<l;i+=2){
		this.points.push({
			x:(arguments[i]),
			y:(i+1<l ? arguments[i+1] : 0)
		});
	}
	
	this.segments = [];
	l = this.points.length-1; 
	for(i=0;i<l;i++){
		if(false && i>0){
			this.segments.push(new Segment(  // dummy welding to compensate line offsets
				this.points[i-1].x, this.points[i-1].y,
				this.points[i].x, this.points[i].y
			));
		}
	
		this.segments.push(new Segment(
			this.points[i].x, this.points[i].y,
			this.points[i+1].x, this.points[i+1].y
		));
	}
	this.closed = false;
}

Path.prototype.close = function(){
	if(!this.closed){
		this.closed = true;
		this.segments.push(new Segment(
			this.points[this.points.length-1].x,
			this.points[this.points.length-1].y,
			this.points[0].x,
			this.points[0].y
		));
		if(false) this.segments.push(new Segment(
			this.points[0].x,
			this.points[0].y,
			this.points[0].x,
			this.points[0].y
		));
	}
}



Path.prototype.draw = function(paper, isBoulder){
	
	
	var ctx = paper.getContext('2d');
	
	
	if(!isBoulder){
		ctx.moveTo( this.points[0].x ,  this.points[0].y);
		var i = 0,
			l = this.segments.length;
		for(;i<l;i++){
			ctx.lineTo(this.segments[i].b.x, this.segments[i].b.y);
		}
		if(this.closed) ctx.closePath();

		ctx.fill();
	}
	
	ctx.moveTo( this.points[0].x ,  this.points[0].y);
	var i = 0,
		l = this.segments.length;
	for(;i<l;i++){
		ctx.strokeStyle = "#cfc";
		if(this.segments[i] instanceof Glass) ctx.strokeStyle="rgba(255,255,255, 0.3)" 
		if(this.segments[i] instanceof Door) ctx.strokeStyle="#cc6" 
		this.segments[i].draw(paper);		
	}
	if(this.closed) ctx.closePath();
	
	
	if(isBoulder){
		ctx.moveTo( this.points[0].x ,  this.points[0].y);
		var i = 0,
			l = this.segments.length;
		for(;i<l;i++){
			ctx.lineTo(this.segments[i].b.x, this.segments[i].b.y);
		}
		if(this.closed) ctx.closePath();

		ctx.fill();
	}
	
	
} 

Path.prototype.makeDoor = function(i){

	var old = this.segments[i];
	this.segments[i] = new Door(old.a.x, old.a.y, old.b.x, old.b.y); 
}

Path.prototype.makeGlass = function(i){

	var old = this.segments[i];
	this.segments[i] = new Glass(old.a.x, old.a.y, old.b.x, old.b.y); 
}

Path.prototype.drawShadow = function(player){
	
} 

Path.prototype.isSeenByBob = function(bob){
	
} 

Path.prototype.seenSegments = function(bob){
	var i=0,
		l=this.segments.length,
		seenSegment = null,
		res =[];
	for(;i<l;i++){
		seenSegment = this.segments[i].seenSegment(bob);
		if(seenSegment.length>0) res = res.concat(seenSegment);
	}
	return res;
} 

Path.prototype.inversed = function(){
	var tmp = this.segments;
	this.points = this.points.reverse();
	
	this.segments = [];
	for(var i=tmp.length-1; i>=0; i--){
		this.segments.push(tmp[i].inversed())
	}
}
