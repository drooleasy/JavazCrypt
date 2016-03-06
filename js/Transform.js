;//console.log("loading transform");
;//console.log("this");
;//console.log(this);


/**
 * a transform coordinates utility
 * @constructor
 * @param {number} x the x location
 * @param {number} y the y location
 * @param {number} angle the angle in radians
 * @param {number} scale the scale
 */
var Transform = function Transform(x, y, angle, scale){
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.scale = scale;
};

/**
 * mixin to add transform capability to another object
 * @param {object} that the object to add tranform capabilities on
 * @return {object} the augmented parameter object
 */
Transform.mixin = function(that){
	var t = new Transform();
	that.x = t.x;
	that.y = t.y;
	that.angle = t.angle;
	that.scale = t.scale;
	that.transform = {
		toLocal : function(/*ctx*/){
			Transform.prototype.toLocal.apply(that, arguments);
		},
		toGlobal : function(/*ctx*/){
			Transform.prototype.toGlobal.apply(that, arguments);
		}
	}
	return that;
}


/**
 * align drawing context on this transform
 * @param {object} ctx the 2D drawing context
 */ 
Transform.prototype.toLocal = function(ctx){
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle);
	ctx.scale(this.scale, this.scale);
	
}
/**
 * undo the toLocal transform
 * @param {object} ctx the 2D drawing context
 */ 
Transform.prototype.toGlobal = function(ctx){
	ctx.scale(1/this.scale, 1/this.scale);
	ctx.rotate(-this.angle);	
	ctx.translate(-this.x, -this.y);
	
}
