

var Transform = function(){
	var that = this instanceof Transform ? this : new Transform(0,0,0,1);
	var ctx = {p:new Point()};
	if(!Transform.router.route(ctx, arguments)) throw "Invalid arguments";
	that.x = ctx.p.x;
	that.y = ctx.p.y;
	that.angle = ctx.angle;
	that.scale = ctx.scale;
	
	return that
}

Transform.router = new ArgRouter();
Transform.router.combine(
	Point.route("p"),
	{
		"":function(){
			this.angle = 0;
			this.scale = 1;
		},
		"num":function(_angle){
			
			this.angle = _angle;
			this.scale = 1;
		},
		"num, num":function(_angle, _scale){
			
			this.angle = _angle;
			this.scale = _scale;
		}
	}
);

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
