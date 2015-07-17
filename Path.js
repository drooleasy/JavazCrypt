
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
	}
}



Path.prototype.path = function(paper){
	var res = "M" + this.points[0].x + " " + this.points[0].y,
		i = 0,
		l = this.segments.length;
	for(;i<l;i++){
		res += "L" +  this.segments[i].b.x + " " + this.segments[i].b.y;
	}
	if(this.closed) res + " Z";
	return res;
}
Path.prototype.draw = function(paper){
	
	paper.path(this.path()).attr({
		"fill":"#000",
		"stroke":"#000",
		"stroke-width" : "1"
	});
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
		if(seenSegment) res.push(seenSegment);
	}
	return res;
} 


