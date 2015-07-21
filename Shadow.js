function Shadow(){
	this.paths = [];
	this.style = {
		"fill" : "#000",
		"stroke" : "#000",
		"stroke-width" : 1,
		"fill-opacity" : 1
	};
	this.element = null;
}

Shadow.prototype.clear = function (paper){
	this.paths = [];
}
Shadow.prototype.draw = function (paper){
	var path = "";
	for(var i = 0; i<this.paths.length;i++){ 
		this.drawCone(paper, this.paths[i])
	}
	
	
}

Shadow.prototype.drawCone = function (paper, coneData){
	var ctx = paper.getContext('2d');
	ctx.fillStyle = this.style["fill"];
	ctx.strokeStyle = this.style["stroke"];
	ctx.lineWidth = this.style["stroke-width"];
	
	ctx.beginPath();
	
	

		ctx.moveTo(coneData.ray_1.a.x, coneData.ray_1.a.y);
		ctx.lineTo(coneData.ray_1.b.x, coneData.ray_1.b.y);
		ctx.arc(coneData.x, coneData.y, coneData.radius, coneData.angle_1, coneData.angle_2);
		ctx.lineTo(coneData.ray_2.a.x, coneData.ray_2.a.y)
		
		if(coneData.bob){
			console.log(coneData.bob.width)
			ctx.arcTo(coneData.bob.x1,coneData.bob.y1,coneData.bob.x2,coneData.bob.y2,coneData.bob.r);
				
		}else{
			ctx.lineTo(coneData.ray_1.a.x, coneData.ray_1.a.y)
		}
	
	
	ctx.closePath();
	//ctx.stroke();
	ctx.fill();
	
}
