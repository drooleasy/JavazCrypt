var TexturePath = function TexturePath(points){
  this.points = points;

  this._texture = null;
}

TexturePath.prototype.texture = function(){
  if(arguments.length){
    this._texture = arguments[0];
    return this;
  }
  return this._texture;
};

/**
 * draw this segment on canvas
 * @param {object} paper the canvas node element
 * @param {boolean} isBoulder true if the path is full and closed
 */
TexturePath.prototype.draw = function(paper){


	var ctx = paper.getContext('2d');


  ctx.beginPath();
  ctx.fillStyle = this._texture;
	ctx.moveTo( this.points[0].x ,  this.points[0].y);
	var i = 1,
		l = this.points.length;
	for(;i<l;i++){
		ctx.lineTo(this.points[i].x, this.points[i].y)
	}
	ctx.closePath();
	ctx.fill();

}
