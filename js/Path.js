/**
 * a path is a series of segments sharing an end point with their precessor/successor
 * @constructor
 * @param {number} x coordinate of a path point
 * @param {number} y coordinate of a path point
 */
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
	this._texture = null;
}



Path.prototype.texture = function(tex){
	if(tex){

		this._texture = tex;
		this.segments.forEach(function(segment, i){

				segment.texture(tex);
		});
		return this;
	}
	return this._texture;
}

/**
 * closes this path (by adding a segment between end and start points)
 */
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


/**
 * draw this segment on canvas
 * @param {object} paper the canvas node element
 * @param {boolean} isBoulder true if the path is full and closed
 */
Path.prototype.draw = function(paper, isBoulder){


	var ctx = paper.getContext('2d');


	ctx.fillStyle="transparent"

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
	//ctx.fill();

}

/**
 * transform a segment of the path into a Door
 * @param {number} i the index of the segment to transform
 */
Path.prototype.makeDoor = function(i, texture){

	var old = this.segments[i];
	this.segments[i] = new Door(old.a.x, old.a.y, old.b.x, old.b.y);
	if(texture){
		this.segments[i].texture(texture);
	}
}

/**
 * transform a segment of the path into a Glass
 * @param {number} i the index of the segment to transform
 */
Path.prototype.makeGlass = function(i, texture){

	var old = this.segments[i];
	this.segments[i] = new Glass(old.a.x, old.a.y, old.b.x, old.b.y);
	if(texture) this.segments[i].texture(texture);
}

/**
 * void stub
 */
Path.prototype.drawShadow = function(player){

}

/**
 * void stub
 */
Path.prototype.isSeenByBob = function(bob){

}

/**
 * compute the seen segment of each part of the path
 * @param {Bob} bob the looking bob
 * @return {array} the seen sub-segments of the path
 */
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

/**
 * reverse this path point order
 */
Path.prototype.inversed = function(){
	var tmp = this.segments;
	this.points = this.points.reverse();

	this.segments = [];
	for(var i=tmp.length-1; i>=0; i--){
		this.segments.push(tmp[i].inversed())
	}
}
