

var Transform = function(x,y,angle,scal){
	this.x = x || 0;
	this.y = y || 0;
	this.angle = angle || 0;
	this.scale = scale || 1;

}

Transform.mixin = function(that,x,y,angle,scale){
	that.x = x || 0;
	that.y = y || 0;
	that.angle = angle || 0;
	that.scale = scale || 1;
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


Transform.prototype.toLocal = function(ctx){
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle);
	ctx.scale(this.scale, this.scale);
	
}
Transform.prototype.toGlobal = function(ctx){
	ctx.scale(1/this.scale, 1/this.scale);
	ctx.rotate(-this.angle);	
	ctx.translate(-this.x, -this.y);
	
}
