/**
 * a Slope is a rectangular shape making the side of a platform
 * @constructor
 * @param {number} x1 the x coordiante of the 1st point
 * @param {number} y1 the y coordiante of the 1st point
 * @param {number} x2 the x coordiante of the 2nd point
 * @param {number} y2 the y coordiante of the 2nd point
 * @param {number} x3 the x coordiante of the 3rd point
 * @param {number} y3 the y coordiante of the 3rd point
 * @param {number} x4 the x coordiante of the 4th point
 * @param {number} y4 the y coordiante of the 4th point
 */
function Slope(/*x1,y1,...,x4,y4*/){
	this.pointCloud = PointCloud.apply(new PointCloud(), arguments);
	//this.pointCloud.sort();
	
	var points = [];
	for(var i=0; i<arguments.length; i+=2){
		points.push({
			x: arguments[i],
			y: arguments[i+1]
		})
	}
	this.sides = arguments.length && [
		new Segment(points[0].x,points[0].y, points[1].x,points[1].y ),
		new Segment(points[3].x,points[3].y, points[2].x, points[2].y)
	] || null;
	this.start = arguments.length && new Segment(points[0].x,points[0].y,points[3].x,points[3].y) || null;
	this.reach = arguments.length && new Segment(points[1].x,points[1].y,points[2].x,points[2].y) || null;


	this.up = true;
	

	return this;
}

/**
 * daws this slope on canvas
 * @param {object} the canvas dom node
 * @param {object} the sun light
 */
Slope.prototype.draw = function(paper, sun){
	var ctx = paper.getContext('2d');

	if(false){
		var center_start = {
			x:(this.start.a.x+this.start.b.x)/2,
			y:(this.start.a.y+this.start.b.y)/2
		};
		var center_reach = {
			x:(this.reach.a.x+this.reach.b.x)/2,
			y:(this.reach.a.y+this.reach.b.y)/2
		}
		

		ctx.fillStyle = "#00F";				
		this.pointCloud.drawPoint(center_start, paper, 6);
		ctx.fill();
		ctx.fillStyle = "#99F";
		this.pointCloud.drawPoint(center_reach, paper, 6);
		ctx.fill();
	}




	var middle_reach = {
		x:(this.reach.a.x + this.reach.b.x)/2,
		y:(this.reach.a.y + this.reach.b.y)/2,
	};
	var angle_sun = angleBetween(sun.x, sun.y, middle_reach.x, middle_reach.y);
	var angle_reach = angleBetween(this.reach.a.x,this.reach.a.y, this.reach.b.x, this.reach.b.y);


	var angle_relative = angle_reach -  angle_sun;
	var sin = Math.sin(angle_relative);

	if(this.up){
		if(sin<=0) l = 50 +  Math.floor(-sin * 155);
		else l = 50 - Math.floor(sin * 50);
	}else{
		if(sin>0) l = 50 +  Math.floor(sin * 155);
		else l = 50 - Math.floor(-sin * 50);
	}

	ctx.fillStyle = "rgba("+l+","+l+","+l+",.6)";				
	this.pointCloud.draw(paper);	
	ctx.fill();

	var dax = this.reach.a.x - this.start.a.x;
	var day = this.reach.a.y - this.start.a.y;
	var dbx = this.reach.b.x - this.start.b.x;
	var dby = this.reach.b.y - this.start.b.y;

	n = 10;
	
	for(i=0;i<n;i++){
			var l = Math.floor(i*256/n),
				t = 1-i/n;
			l=128;
			ctx.strokeStyle= "rgba("+l+","+l+","+l+", "+t+")"
			ctx.beginPath();
			ctx.moveTo(
				this.start.a.x +i*dax/n,
				this.start.a.y +i*day/n
			);
			
			ctx.lineTo(
				this.start.b.x +i*dbx/n,
				this.start.b.y +i*dby/n
			);
			ctx.stroke();
	} 

	// DEAD CODE
	if(false){
		ctx.fillStyle = "rgba(0,0,0,0)";				
		
			ctx.strokeStyle = "#FFF";
			this.pointCloud.plot(paper);


			
			
			ctx.strokeStyle = "#FF0";
			for(var i=0; i< this.sides.length; i++){
				this.sides[i].draw(paper);
			}
			
			ctx.strokeStyle = "#0F0";
			this.start.draw(paper);
			
			ctx.strokeStyle = "#F00";
			this.reach.draw(paper);
		
	}

}

/**
 * test if a point is inside the slope
 * @param {number} x the x coordinate of the point to test
 * @param {number} y the y coordinate of the point to test
 * @return {boolean} true if point is inside
 */
Slope.prototype.inside = function(x,y){
	return this.pointCloud.inside(x, y);
}



/**
 * calculate the interpolation factor of a bob between the start and reach of the slope
 * @param {Bob} player the player
 * @return {number} the interpolation factor between srat and reach
 */
Slope.prototype.interpole = function interpole(player){
	
	var ctx = paper.getContext('2d');
	
	var closestStart = this.start.closestPointFrom(player.x, player.y);
	var closestReach = this.reach.closestPointFrom(player.x, player.y);


	ctx.fillStyle="#CCC";
	this.pointCloud.drawPoint({x:closestStart.x, y:closestStart.y}, paper, 3);
	ctx.fill();
	
	ctx.fillStyle="#CCC";
	this.pointCloud.drawPoint({x:closestReach.x, y:closestReach.y}, paper, 3);
	ctx.fill();
	
	var distance = distanceBetween(closestStart.x, closestStart.y, player.x, player.y);
	var len = distanceBetween(closestStart.x, closestStart.y, closestReach.x, closestReach.y);
	
	var interpole = distance / len;
	
//	console.log("---------------");
//					console.log("interpole_start: "+interpole_start)
//					console.log("interpole_left: "+interpole_left)
//					console.log("interpole_right: "+interpole_right)
//	console.log("interpole: "+interpole);
	
	return interpole;
}


/**
 * checks if a bob is on the slope and scale him accordingly
 * @param {Bob} player the bob to check
 */
Slope.prototype.check = function checkStair(player){
	
		
	var x = player.x;
	var y = player.y;
	
	
	var playerOnStair = this.inside(x,y);
	
	if(playerOnStair){
		var z = 1-this.interpole(player);
		
		
		
		if(this.up) player.scale = 1 + (z / 2);
		else player.scale = 1 - (z / 4);
		
	
		// WTF ?
		var cp = this.reach.closestPointFrom(player.x,player.y);
		var d = distanceBetween(cp.x, cp.y, player.x, player.y);
		if(d<player.width){
			//this.onReach.call(this, player);
		}
		
	}
	
}
