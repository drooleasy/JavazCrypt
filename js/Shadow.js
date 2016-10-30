/**
 * a shadow is an area of the world to darken
 * @constructor
 */
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

/**
 * resets the shadow's paths
 */
Shadow.prototype.clear = function (paper){
	this.paths = [];
}


/**
 * draw each shadow's path
 * @param {object} paper the canvas dom node to draw on
 */
Shadow.prototype.draw = function (paper){


	for(var i = 0; i<this.paths.length;i++){
		this.drawCone(paper, this.paths[i])
	}

}

/**
 * draw one shadow path (a cone)
 * @param {object} paper the canvas dom node to draw on
 * @param {object} coneData the shadow's cone
 */
Shadow.prototype.drawCone = function (paper, coneData){
	var ctx = paper.getContext('2d');

	ctx.strokeStyle = this.style.stroke;
	ctx.fillStyle = this.style.fill;
	ctx.beginPath();


	if(coneData.type && coneData.type=="over"){

		ctx.arc(coneData.x, coneData.y, coneData.radius, 0, 2*Math.PI)

	}else{
		ctx.moveTo(coneData.ray_1.a.x, coneData.ray_1.a.y);

		ctx.lineTo(coneData.ray_1.b.x, coneData.ray_1.b.y);


		ctx.arc(coneData.x, coneData.y, coneData.radius, coneData.angle_1, coneData.angle_2);
		ctx.lineTo(coneData.ray_2.a.x, coneData.ray_2.a.y)

		if(coneData.bob){
			ctx.arcTo(coneData.bob.x1,coneData.bob.y1,coneData.bob.x2,coneData.bob.y2,coneData.bob.r);

		}else{
			ctx.lineTo(coneData.ray_1.a.x, coneData.ray_1.a.y)
		}
	}
//	ctx.stroke();
	ctx.fill();
}
