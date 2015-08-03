
function rect(x,y,w,h, angle){
	
	
	return  [
		{//topLeft	
			x:x,
			y:y
		},
		{//bottomLeft
			x:x + Math.cos(angle + Math.PI/2) * h,
			y:y + Math.sin(angle + Math.PI/2) * h
		},
		{//bottomRight
			x:x + Math.cos(angle + Math.PI/2) * h + Math.cos(angle) * w,
			y:y + Math.sin(angle + Math.PI/2) * h + Math.sin(angle) * w

		},
		{//topRight
			x:x + Math.cos(angle) * w,
			y:y + Math.sin(angle) * w
		}

	
	]
	
};


function Stair(x,y, w, h, steps, angle, up, onReach){
	
	
	
	
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.angle = angle ;
	this.steps = steps
	this.up = up;
	
	this.onReach = onReach || function(player){
		console.log((this.up ? "up" : "down") + "stairs!!!");
		player.collidesWithSegment(this.reach());
	}
	
	this.dec = this.w*0.033;
	
	
	

	
	this.case = function(){
			
		var rec = rect(this.x,this.y, this.w,this.h, this.angle)
		return [
			new Segment(
				rec[0].x, rec[0].y, 
				rec[1].x, rec[1].y
			),
			new Segment(
				rec[1].x, rec[1].y, 
				rec[2].x, rec[2].y
			),
			new Segment(
				rec[2].x, rec[2].y,
				rec[3].x, rec[3].y
			)
		];
	}
	
	
	this.innerCase = function(){
		var rec = rect(this.x,this.y, this.w,this.h, this.angle)
		var offset = (this.up ? -1 : 1) * this.dec * (this.steps-1);

		return [
			new Segment(
				rec[0].x, rec[0].y, 
				rec[1].x + Math.cos(this.angle) * offset, rec[1].y + Math.sin(this.angle) * offset
			),
			new Segment(
				rec[2].x + Math.cos(this.angle+Math.PI) * offset, rec[2].y + Math.sin(this.angle+Math.PI) * offset, 
				rec[3].x, rec[3].y
			)
		];
	};
	this.reach = function(){
		var rec = rect(this.x,this.y, this.w,this.h, this.angle)
		var offset = (this.up ? -1 : 1) * this.dec * (this.steps-1);

		return new Segment(
			rec[1].x + Math.cos(this.angle) * offset, rec[1].y + Math.sin(this.angle) * offset,
			rec[2].x + Math.cos(this.angle+Math.PI) * offset, rec[2].y + Math.sin(this.angle+Math.PI) * offset 
		);
	}

	
}
Stair.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");


	ctx.translate(this.x,this.y);
	ctx.rotate(this.angle);


	ctx.fillStyle="#999";
	ctx.strokeStyle="#FFF";


	ctx.strokeRect(0,0, this.w, this.h);
	
	var step_width = this.w;
	var step_height = this.h/this.steps;
	
	
	if(this.up){
		for(var i=0;i<this.steps;i++){
			var offset = -1 * this.dec * i;
			ctx.fillRect(
				offset,
				i*step_height, 
				step_width - 2*offset, 
				step_height
			);
			ctx.strokeRect(
				offset,
				i*step_height, 
				step_width - 2*offset, 
				step_height
			);
		}
	}else{
		for(var i=this.steps-1;i>=0;i--){
			var offset = 1 * this.dec * i;
		
			ctx.strokeRect(
				offset,
				i*step_height, 
				step_width - 2*offset, 
				step_height
			);
		
			ctx.fillRect(
				offset,
				i*step_height, 
				step_width - 2*offset, 
				step_height
			);
		
		}
	}
	
	



	ctx.rotate(-this.angle);
	ctx.translate(-this.x,-this.y);



	
	ctx.fillStyle="rgba(0,0,0,.3)";
	ctx.strokeStyle=ctx.fillStyle;
	
	
	ctx.beginPath();
	
	var inner = this.innerCase();
	ctx.moveTo(inner[0].a.x, inner[0].a.y);
	inner[0].draw(paper, true);
	this.reach().draw(paper, true);
	inner[1].draw(paper, true);

	var cases = this.case();
	for(i=cases.length-1;i>=0;i--){
		cases[i].inversed().draw(paper, true);
		
	}

ctx.closePath();
	ctx.stroke();
	ctx.fill();


/*
	ctx.strokeStyle="#FF0";

	ctx.beginPath();
	
	var inner = this.innerCase();
	ctx.moveTo(inner[0].a.x, inner[0].a.y);
	inner[0].draw(paper, true);
	this.reach().draw(paper, true);
	inner[1].draw(paper, true);


ctx.stroke();

	ctx.strokeStyle="#F00";
	
	ctx.beginPath();
	
	var cases = this.case();
	for(i=cases.length-1;i>=0;i--){
		cases[i].inversed().draw(paper, true);
		
	}

ctx.stroke();
*/
	
}


Stair.prototype.check = function checkStair(player){
		
		var x = player.x;
		var y = player.y;
		
		x-=this.x;
		y-=this.y;
		
		var m = distanceAndAngle(0,0,x,y);
		
		x = Math.cos(m.angle-this.angle) * m.distance;
		y = Math.sin(m.angle-this.angle) * m.distance;
		
		var playerOnStair = (
			0 <  x && x < this.w
			&& 0 < y && y < this.h
		);
		var currentCase = playerOnStair ? this.innerCase() : this.case();
		
		for(var i=0; i<currentCase.length;i++) player.collidesWithSegment(currentCase[i]);
		
		var this_attenuation = 2
		
		if(playerOnStair){
			var z = y / this.h;
			
			var reach = this.reach();
			var bottomCase = this.case()[1];
			
			var d = distanceBetween(reach.a.x,reach.a.y,reach.b.x,reach.b.y);
			var d2 = distanceBetween(bottomCase.a.x,bottomCase.a.y,bottomCase.b.x,bottomCase.b.y);
			
			var ratio =  d/d2 ;
			
			player.scale = 1 + (this.up ? 0.5 : -1) * z*z * ratio;
			if(this.debug)console.log("1 + "+(this.up ? 0.5 : -1) + " * "+z.toFixed(1)+"*"+z.toFixed(1)+" * " + ratio.toFixed(1))
			var cp = reach.closestPointFrom(player.x,player.y);
			var d = distanceBetween(cp.x, cp.y, player.x, player.y);
			if(d<player.width){
				this.onReach.call(this, player);
			}
			
		}
		
	}


Stair.prototype.inverse = function(){
	
	var x = this.x + Math.cos(this.angle) * this.w + Math.cos(this.angle+Math.PI/2) * this.h,
		y = this.y + Math.sin(this.angle) * this.w + Math.sin(this.angle+Math.PI/2) * this.h,
		w = this.w,
		h = this.h,
		s = this.steps,
		a = clipAngle(this.angle - Math.PI),
		u = !this.up,
		cb = this.onReach;
		 
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.steps = s;
	this.angle = a;
	this.up = u;
	this.onReach = cb;
	
}
