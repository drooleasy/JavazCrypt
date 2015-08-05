function Interval(from, to){
	if(arguments.length < 1) from = 0;
	if(arguments.length < 2) to = from;
	
	this.from = function(x){
		if(x!==undefined){
			from = x;
			return this;
		}
		return from;
	};
	
	this.to = function(x){
		if(x!==undefined){
			to = x;
			return this;
		}
		return to;
	};
}


Interval.prototype.min = function(){
	return Math.min(this.from(), this.to());
}

Interval.prototype.max = function(){
	return Math.max(this.from(), this.to());
}

Interval.prototype.includes = function(x){
	return  this.min() <= x && x <= this.max()
}
Interval.prototype.excludes = function(x){
	return  this.min() > x || x > this.max();
}

Interval.prototype.covers = function(inter){
	return this.min() <= inter.min && this.max() >= inter.max();
}


Interval.prototype.offset = function(x){
	return new Interval(this.from() + x, this.to() + x);
} 


Interval.prototype.scaleFrom = function(x, factor){
	var dfrom = this.from()-x,
		newFrom = x + dfrom * factor;
	
	return new Interval(newFrom, newFrom + this.length(true) * factor);
} 

Interval.prototype.scaleFromMiddle = function(factor){ return this.scaleFrom(this.middle(), factor); }
Interval.prototype.scaleFromStart = function(factor){ return this.scaleFrom(this.from(), factor); }
Interval.prototype.scaleFromEnd = function(factor){ return this.scaleFrom(this.to(), factor); }


Interval.prototype.length = function(signed){
	var res = this.max() - this.min();
	return (signed && this.isDescending()) ? -res : res;
};

Interval.prototype.add = function(v){
	var opFrom = Math.min,
		opTo = Math.max;
	if(false && this.isDescending()){
		opFrom = Math.max;
		opTo = Math.min;
	}

	this.from(opFrom.call(null, this.from(), v));
	this.to(opTo.call(null, this.to(), v));
	return this;
};


Interval.prototype.ascending = function(){
	return new Interval(this.min(), this.max());
}
Interval.prototype.descending = function(){
	return new Interval(this.max(), this.min());
}


Interval.prototype.isAscending = function(){
	return this.from() < this.to();
}
Interval.prototype.isDescending = function(){
	return this.from() > this.to();
}


Interval.prototype.isPositive = function(){
	return this.min() >= 0 &&  this.to() >= 0;
}
Interval.prototype.isNegative = function(){
	return this.min() <= 0 && this.to() <= 0;
}

Interval.prototype.isPoint = function(){
	return this.from() == this.to();
}

Interval.prototype.reverse = function(){
	var t = this.from(),
		f = this.to();
	return new Interval(f, t);
}

Interval.prototype.middle = function(){
	return this.from() + this.length(true)/2;
}

Interval.prototype.rapport = function(x){
	return (x-this.from()) / this.length();
};

Interval.prototype.clamp = function(x, circular){
	if(circular){
		var	r = x - this.min()
			l = this.length(),
			mod = (r % l),
			s = this.isAscending() ? 1 : -1;
		mod = mod >= 0 ? mod : l+mod;
		return this.min() + mod;	
	}else{
		if(x<this.min()) return this.min();
		else if(x>this.max()) return this.max();
		else return x;
	}
}

Interval.prototype.random = function(){
	var i = Math.random();
	return this.min() + i * this.length();
}


Interval.prototype.randomMin = function(){
	var i = Math.random();
	return this.min() + i*i * this.length();
}


Interval.prototype.randomMax = function(){
	var i = Math.random();
	return this.max() - i*i * this.length();
}


Interval.prototype.randomFrom = function(){
	var i = Math.random(),
		s = this.isAscending() ? 1 : -1;
	return this.from() + s * i*i * this.length();
}


Interval.prototype.randomTo = function(){
	var i = Math.random(),
		s = this.isAscending() ? -1 : 1;
	return this.to() + s* i*i * this.length();
}

Interval.prototype.randomMiddle = function(){
	var i = Math.random(),
		s = Math.random() > 0.5 ? -1 : 1;
	return this.middle() + s* i*i * this.length()/2;
}


Interval.prototype.interpolate = function(i, circular){
	
	var s = this.isAscending() ? 1 : -1,
		res = this.from() + s * i * this.length();
	if(circular){
		return this.clamp(res, true);
	}
	return res;
}


Interval.prototype.interpolateFromMiddle = function(i, circular){
	
	var	middle = this.middle(),
		demi = new Interval(middle, this.to());
	 return demi.interpolate(i, circular);
	
}


Interval.prototype.array = function(){
		return [this.from(), this.to()];
}



Interval.prototype.intersects = function(other){
	return !(this.min()>other.max() || other.min() > this.max()); 
}
Interval.prototype.intersection = function(other){
	var maxOfMins = Math.max(this.min(), other.min()),
		minOfMaxs = Math.min(this.max(), other.max());
	if(minOfMaxs < maxOfMins) return null;
	return new Interval(maxOfMins, minOfMaxs);
}

Interval.prototype.minus = function(other){
	var inter = this.intersection(other);
	if(!inter) return new Interval(this.from(), this.to());
	if(inter.min() == this.min() && inter.max()==this.max()) return [];
	else if(inter.min() == this.min()) return [new Interval(inter.max(), this.max())];
	else if(inter.max() == this.max()) return [new Interval(this.min(), inter.min())];
	else return [
		new Interval(this.min(), inter.min()),
		new Interval(inter.max(), this.max())
	]
}

Interval.prototype.union = function(other){
	var inter = this.intersection(other);
	var res = [];
	if(!inter){
		res.push(new Interval(
			this.from(), this.to()
		));
		res.push(new Interval(
			other.from(), other.to()
		));
	}else{
		res.push(new Interval(
			Math.min(this.min(), other.min()),
			Math.max(this.max(), other.max())
		));
	}
	return res;

}

Interval.prototype.difference = function(other){
	var inter = this.intersection(other);
	var res = [];
	if(!inter) {
		res.push(new Interval(
			this.from(), this.to()
		));
		res.push(new Interval(
			other.from(), other.to()
		));
		
	}else{
		var union = this.union(other); // assert(union.length==1)
		res = union[0].minus(inter);
	}
	return res;
}


Interval.prototype.slices = function(n){
	var abs = Math.abs(n),
		sliceLength = this.length()/abs,
		start = (n > 0 ? this.from() : this.to()),
		s = (this.isAscending() ? 1 : -1);
		res = [],
		i=0;
	if(n<0) s *= -1;
	for(;i<abs;i++){
		res.push(new Interval(
			start + s*i*sliceLength, 
			start + s*(i+1)*sliceLength
		));
	}
	return res;
}

Interval.prototype.clone = function(){
	return new Interval(this.from(), this.to());
}

Interval.prototype.toString = function(){
	return "[ "+ this.from().toFixed(3) + ", " + this.to().toFixed(3) +" ]";
}

// STATICS

Interval.fromCenter = function(c, r){
	return new Interval(c-r, c+r);
}


Interval.unity = function(){
	return new Interval(0, 1);
}

Interval.signedUnity = function(){
	return new Interval(-1, 1);
}

Interval.bit8 = function(){
	return new Interval(0, 256 -1);
}

Interval.bit16 = function(){
	return new Interval(0, 256*256 -1);
}

Interval.bit32 = function(){
	return new Interval(0, 256*256*256*256 -1);
}


Interval.bit64 = function(){
	return new Interval(0, 256*256*256*256 * 256*256*256*256 -1);
}

Interval.circle = function(){
	return new Interval(-Math.PI, Math.PI);
};

Interval.circlePositive = function(){
	return new Interval(0, 2*Math.PI);
};

Interval.circleNegative = function(){
	return new Interval(-2*Math.PI, 0);
};


Interval.circleDegree = function(){
	return new Interval(-180, 180);
};

Interval.circleDegreePositive = function(){
	return new Interval(0, 360);
};

Interval.circleDegreeNegative = function(){
	return new Interval(0, -360);
};

Interval.prototype.iterate = function(cb, inc_abs){
	inc_abs = Math.abs(inc_abs) || 1;
	if(this.isAscending()){
		var f = Math.ceil(this.from());
		var t = Math.floor(this.to());
		var inc = inc_abs;
		for(;f<=t;f+=inc){
			cb(f);
		}
	}else{
		var f = Math.floor(this.from());
		var t = Math.ceil(this.to());
		var inc = -inc_abs;
		for(;f>=t;f+=inc){
			cb(f);
		}
	}
}


function div(x, m){
	var d = x > 0 ? Math.floor(x/m) : Math.ceil(x/m),
		mod = x%m;
	return {
		divided:x,
		divisor:m,
		remain: mod,
		value: d,
		cliped: (mod>0 ? mod : m + mod)	
	}
}
