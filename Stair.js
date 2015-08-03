function Stair(x,y, w, h, steps, up){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.steps = steps
	this.up = up;
	this.case = new Path(
		this.x, this.y,
		this.x, this.y+this.h,
		this.x+this.w, this.y+this.h,
		this.x+this.w, this.y
	);
	
	this.dec = this.w*0.033;
	
	
	this.case = [
		new Segment(this.x, this.y, this.x, this.y+this.h),
		new Segment(this.x, this.y+this.h, this.x+this.w, this.y+this.h),
		new Segment(this.x+this.w, this.y+this.h, this.x+this.w, this.y)
	];
	
	var offset = (this.up ? -1 : 1) * this.dec * (this.steps-1);
	console.log((this.up ? -1 : 1) + " * " +  this.dec  + " * " + (this.steps-1));
	this.innerCase = [
		new Segment(this.x, this.y, this.x + offset, this.y+this.h),
		new Segment(this.x + this.w - offset , this.y+this.h, this.x + this.w, this.y)
	];
	this.reach = new Segment(
		this.x + offset, this.y+this.h, this.x + this.w - offset , this.y+this.h
	);
	

	
}
Stair.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	ctx.fillStyle="#999";
	ctx.strokeStyle="#FFF";
	ctx.strokeRect(this.x,this.y, this.w, this.h);
	
	var step_width = this.w;
	var step_height = this.h/this.steps;
	

	
	for(var i=0;i<this.steps;i++){
		var offset = (this.up ? -1 : 1) * this.dec * i;
		ctx.fillRect(
			this.x+offset,
			this.y+i*step_height, 
			step_width - 2*offset, 
			step_height
		);
		ctx.strokeRect(
			this.x+offset,
			this.y+i*step_height, 
			step_width - 2*offset, 
			step_height
		);
	}
	
	
	ctx.fillStyle="rgba(0,0,0,.3)";
	ctx.strokeStyle=ctx.fillStyle;
	
	
	ctx.beginPath();
	
	ctx.moveTo(this.innerCase[0].x,this.innerCase[0].y);
	this.innerCase[0].draw(paper, true);
	this.reach.draw(paper, true);
	this.innerCase[1].draw(paper, true);

	for(i=this.case.length-1;i>=0;i--){
		this.case[i].inversed().draw(paper, true);
		
	}


	ctx.closePath();
	ctx.stroke();
	ctx.fill();
}


Stair.prototype.check = function checkStair(player){
		var playerOnStair = (
			this.x < player.x && player.x < this.x+this.w
			&& this.y < player.y && player.y < this.y+this.h
		);
		var currentCase = playerOnStair ? this.innerCase : this.case;
		
		for(var i=0; i<currentCase.length;i++) player.collidesWithSegment(currentCase[i]);
		
		var this_attenuation = 2
		
		if(playerOnStair){
			var z = (this.h - (player.y-this.y)/this_attenuation) / this.h;
			if(this.up) z = 1 + ((player.y-this.y)/this_attenuation) / this.h;
			player.width = z * original_width;
			
			var cp = this.reach.closestPointFrom(player.x,player.y);
			var d = distanceBetween(cp.x, cp.y, player.x, player.y);
			if(d<player.width){
				console.log((this.up ? "up" : "down") + "stairs!!!")
				player.collidesWithSegment(this.reach)
			}
			
		}
		
	}
