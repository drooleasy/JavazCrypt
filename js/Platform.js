/**
 * a land platform (upward or downward
 * @constructor
 * @param {Path} inner the inner shape of the platform (must be same point count as outer)
 * @param {Path} outer the outer shape of the platform (must be same point count as inner)
 * @param {boolean} up wheter upward or downward platform (default to true : upward)
 */
function Platform(inner, outer, up){

	this.inner = inner;
	this.outer = outer;
	
	this.slopes = [];
		
	this.up = !!up;
			
	
	
	function addSlope(inner, outer, i, up){
		var arr = [];
		
		var j = i+1;
		if(j>=inner.points.length) j = 0; 
		arr.push(inner.points[i].x);
		arr.push(inner.points[i].y);
		
		
		arr.push(outer.points[i].x);
		arr.push(outer.points[i].y);
		
		
		arr.push(outer.points[j].x);
		arr.push(outer.points[j].y);
		
		
		arr.push(inner.points[j].x);
		arr.push(inner.points[j].y);
		
		var res =  Slope.apply(new Slope(), arr);
		res.up = up
		return res;
	}
	
	for(var i=0;i<num_points;i++){
		this.slopes.push(addSlope(inner,outer, i, this.up));
	}

	
}

/**
 * checks if a bob is on the platform, scales the bob accordingly
 * @param {Bob} player the bob to check
 */ 
Platform.prototype.check = function(player){
	for(var i=0;i<this.slopes.length;i++){				
		if(this.slopes[i].inside(player.x, player.y)){
			this.slopes[i].check(player);
		}
	}
}

/**
 * draws the platform
 * @param {object} paper the canvas
 * @param {object} sun the sun light
 */
Platform.prototype.draw = function(paper, sun){
	
	for(var i=0;i<this.slopes.length;i++){
			this.slopes[i].draw(paper, sun);
	}
}
