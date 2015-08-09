;//console.log("loading transform");
;//console.log("this");
;//console.log(this);



var Transform = ArgRouter.decorate(
	{
		p: null,
		angle: 0,
		scale: 1
	},
	ArgRouter.combine(
		Point.route("p"),
		{
			"":function(){
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
	),
	function Transform(ctx){
		this.x = ctx.p.x;
		this.y = ctx.p.y;
		this.angle = ctx.angle;
		this.scale = ctx.scale;
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
