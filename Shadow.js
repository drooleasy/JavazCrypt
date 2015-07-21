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
		ctx.arc(coneData.x, player.y, coneData.radius, coneData.angle_1, coneData.angle_2);
		ctx.lineTo(coneData.ray_2.a.x, coneData.ray_2.a.y)
		ctx.lineTo(coneData.ray_1.a.x, coneData.ray_1.a.y)
	
	
	
	
	//ctx.stroke();
	ctx.fill();
	
}
