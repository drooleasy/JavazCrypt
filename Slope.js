
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

	return this;
}


Slope.prototype.draw = function(paper){
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
/*
	var grd = ctx.createLinearGradient(
		center_start.x, 
		center_start.y, 
		center_reach.x, 
		center_reach.y
	);

	var grd = ctx.createRadialGradient(
		center_start.x, 
		center_start.y,
		0, 
		center_start.x, 
		center_start.y,
		distanceBetween(center_start.x, center_start.y,center_reach.x, center_reach.y)
		
		
	);
/*	
	var grd = ctx.createLinearGradient(
		this.start.a.x, 
		this.start.a.y, 
		this.reach.a.x, 
		this.reach.a.y
	);

	grd.addColorStop(0, "#fff");
	grd.addColorStop(1, "#000");







	ctx.save();
*/				
	//this.pointCloud.draw(paper);

//	ctx.clip()
//	ctx.fillStyle = grd;	

//	ctx.fillRect(0,0,paper.width,paper.height);
//	ctx.restore();


var sun = {x:1,y:1};
var angle_sun = angleBetween(0,0, sun.x, sun.y);
var angle_reach = angleBetween(this.reach.a.x,this.reach.a.y, this.reach.b.x, this.reach.b.y);


var angle_relative = angle_reach -  angle_sun;
var sin = Math.sin(angle_relative);


l = 0;
if(l<=0) l = 50 +  Math.floor(-sin * 155);
else l = 50;


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
			l=255;
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
Slope.prototype.inside = function(x,y){
	return this.pointCloud.inside(x, y);
}




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



Slope.prototype.check = function checkStair(player){
	
	
	this.up = true;
		
	var x = player.x;
	var y = player.y;
	
	
	var playerOnStair = this.inside(x,y);
	
	if(playerOnStair){
		var z = 1-this.interpole(player);
		
		
		
		player.scale = 1+z*z;
		
		var cp = this.reach.closestPointFrom(player.x,player.y);
		var d = distanceBetween(cp.x, cp.y, player.x, player.y);
		if(d<player.width){
			//this.onReach.call(this, player);
		}
		
	}
	
}
