/**
 * one-dimension numeric inteval
 * @constructor
 * @param {number} from starting point, default to 0
 * @param {number} from end point, default to 0
 */
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

/**
 * calculate the min of the two end points
 * @return {number} the minimun of the two endpoints
 */
Interval.prototype.min = function(){
	return Math.min(this.from(), this.to());
}

/**
 * calculate the max of the two end points
 * @return {number} the maximun of the two endpoints
 */
Interval.prototype.max = function(){
	return Math.max(this.from(), this.to());
}

/**
 * checks if a number is in the interval
 * @param {number} x the number to test for inclusion
 * @return {boolean} true if the number is in the interval
 */
Interval.prototype.includes = function(x){
	return  this.min() <= x && x <= this.max()
}

/**
 * checks if a number is out of the interval
 * @param {number} x the number to test for exclusion
 * @return {boolean} true if the number is out of the interval
 */
Interval.prototype.excludes = function(x){
	return  this.min() > x || x > this.max();
}

/** check if this interval covers completely an other interval
 * @param {Interval} inter the other interval
 * @return {boolean} true if this interval covers (eg includes) the other
 */
Interval.prototype.covers = function(inter){
	return this.min() <= inter.min && this.max() >= inter.max();
}

/**
 * create a new interval as the offset of the current one
 * @param {number} x the offset for the new interval
 * @return {Interval} the offseted interval
 */
Interval.prototype.offset = function(x){
	return new Interval(this.from() + x, this.to() + x);
} 

/**
 * create an interval scaled from this one and a given point according to a factor
 * @param {number} x the point to scale from
 * @param {number} factor the scale factor
 * @return {Interval} the scaled interval
 */
Interval.prototype.scaleFrom = function(x, factor){
	var dfrom = this.from()-x,
		newFrom = x + dfrom * factor;
	
	return new Interval(newFrom, newFrom + this.length(true) * factor);
} 

/**
 * create an interval scaled from the center of this one according to a factor
 * @param {number} factor the scale factor
 * @return {Interval} the scaled interval
 */
Interval.prototype.scaleFromMiddle = function(factor){ return this.scaleFrom(this.middle(), factor); }

/**
 * create an interval scaled from the starting of this one according to a factor
 * @param {number} factor the scale factor
 * @return {Interval} the scaled interval
 */
Interval.prototype.scaleFromStart = function(factor){ return this.scaleFrom(this.from(), factor); }
/**
 * create an interval scaled from the end of this one according to a factor
 * @param {number} factor the scale factor
 * @return {Interval} the scaled interval
 */
Interval.prototype.scaleFromEnd = function(factor){ return this.scaleFrom(this.to(), factor); }

/**
 * calculates the length (signed or not) of the interval
 * @param {boolean} signed wether the length should be signed (default to false)
 * @return {number} the length (signed or not) of the interval
 */
Interval.prototype.length = function(signed){
	var res = this.max() - this.min();
	return (signed && this.isDescending()) ? -res : res;
};

/**
 * WTF ?
 */
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


/**
 * return a new interval in ascending order
 * @return {Interval} the same interval in ascending order
 */
Interval.prototype.ascending = function(){
	return new Interval(this.min(), this.max());
}

/**
 * return a new interval in descending order
 * @return {Interval} the same interval in descending order
 */
Interval.prototype.descending = function(){
	return new Interval(this.max(), this.min());
}

/**
 * tests if this interval is in ascending order (from<to)
 * @return {boolean} true if the interval is in ascending order
 */
Interval.prototype.isAscending = function(){
	return this.from() < this.to();
}

/**
 * tests if this interval is in descending order (from<to)
 * @return {boolean} true if the interval is in descending order
 */
Interval.prototype.isDescending = function(){
	return this.from() > this.to();
}

/**
 * tests if this interval has both ends in the positive
 * @return {boolean} true if both ends are positive (or null)
 */
Interval.prototype.isPositive = function(){
	return this.from() >= 0 &&  this.to() >= 0;
}

/**
 * tests if this interval has both ends in the negative
 * @return {boolean} true if both ends are negative (or null)
 */
Interval.prototype.isNegative = function(){
	return this.from() <= 0 && this.to() <= 0;
}

/**
 * tests if this interval is a point (from=to)
 * @return {boolean} true if from == to
 */
Interval.prototype.isPoint = function(){
	return this.from() == this.to();
}

/**
 * return a new interval by swaping the ends of this one
 * @return {Interval} the swaped interval
 */
Interval.prototype.reverse = function(){
	var t = this.from(),
		f = this.to();
	return new Interval(f, t);
}

/**
 * compute the center of this interval
 * @return {integer} the center of the interval
 */
Interval.prototype.middle = function(){
	return this.from() + this.length(true)/2;
}

/**
 * calculate the position of a point on this interval's scale
 * @param {number} x the point to calculate
 * @return {number} the position of the point on this interval's scale
 */
Interval.prototype.rapport = function(x){
	return (x-this.from()) / this.length();
};

/**
 * clamp a number in this interval (eventually the moudulo way
 * @param {number} x the number to clamp
 * @param {boolean} circular wheither to clamp the modulo way (defaults to false)
 * @return {number} the clamped number
 */
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

/**
 * gives a random point in this interval
 * @return {number} a random point in this interval
 */
Interval.prototype.random = function(){
	var i = Math.random();
	return this.min() + i * this.length();
}

/**
 * gives a random point in this interval, biased toward the minimum
 * @return {number} a random point in this interval, biased toward the minimum
 */
Interval.prototype.randomMin = function(){
	var i = Math.random();
	return this.min() + i*i * this.length();
}


/**
 * gives a random point in this interval, biased toward the maximum
 * @return {number} a random point in this interval, biased toward the maximum
 */

Interval.prototype.randomMax = function(){
	var i = Math.random();
	return this.max() - i*i * this.length();
}


/**
 * gives a random point in this interval, biased toward the from endpoint
 * @return {number} a random point in this interval, biased toward the from endpoint
 */
Interval.prototype.randomFrom = function(){
	var i = Math.random(),
		s = this.isAscending() ? 1 : -1;
	return this.from() + s * i*i * this.length();
}


/**
 * gives a random point in this interval, biased toward the to endpoint
 * @return {number} a random point in this interval, biased toward the to endpoint
 */
Interval.prototype.randomTo = function(){
	var i = Math.random(),
		s = this.isAscending() ? -1 : 1;
	return this.to() + s* i*i * this.length();
}


/**
 * gives a random point in this interval, biased toward the middle
 * @return {number} a random point in this interval, biased toward the middle
 */
Interval.prototype.randomMiddle = function(){
	var i = Math.random(),
		s = Math.random() > 0.5 ? -1 : 1;
	return this.middle() + s* i*i * this.length()/2;
}


/**
 * intepolate according to this interval scale
 * @param {number} i the interpolation factor
 * @param {boolean} cicular whether to clamp the resulting point in this interval (defaults to false)
 * @return {number} the interpolated point
 */
Interval.prototype.interpolate = function(i, circular){
	
	var s = this.isAscending() ? 1 : -1,
		res = this.from() + s * i * this.length();
	if(circular){
		return this.clamp(res, true);
	}
	return res;
}

/**
 * intepolate according to this interval scale, starting from the center
 * @param {number} i the interpolation factor
 * @param {boolean} cicular whether to clamp the resulting point in this interval (defaults to false)
 * @return {number} the interpolated point
 */

Interval.prototype.interpolateFromMiddle = function(i, circular){
	
	var	middle = this.middle(),
		demi = new Interval(middle, this.to());
	 return demi.interpolate(i, circular);
	
}

/**
 * returns this interval as an array
 * @return {array} the from and to value
 */
Interval.prototype.array = function(){
		return [this.from(), this.to()];
}


/**
 * checks if this interval intersects another
 * @param {Interval} other the other interval
 * @return {boolean} true if the intervals intersects
 */
Interval.prototype.intersects = function(other){
	return !(this.min()>other.max() || other.min() > this.max()); 
}
/**
 * give the interesection of this interval and another (as an Interval)
 * @param {Interval} other the other interval
 * @return {Interval} the intersection or null
 */
Interval.prototype.intersection = function(other){
	var maxOfMins = Math.max(this.min(), other.min()),
		minOfMaxs = Math.min(this.max(), other.max());
	if(minOfMaxs < maxOfMins) return null;
	return new Interval(maxOfMins, minOfMaxs);
}

/**
 * substract another interval from this one
 * @param {Interval} other the interval to substract
 * @return {Interval} a new interval or array of intervals
 */
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
/**
 * joins two intervals
 * @param {Interval} other the interval to unite with
 * @return {array} array of one or two intervals (two if they were disjoined)
 */
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

/**
 * returns the non intersecting parts of two intervals
 * @param {Interval} other the other interval
 * @return {array} array of one or two intervals (two if they were disjoined)
 */
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

/**
 * slices an interval
 * @param {number} n the number of slices
 * @return {array} arrays of Interval (the slices)
 */
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

/**
 * clone this interval
 * @return {Interval} the cloned interval
 */
Interval.prototype.clone = function(){
	return new Interval(this.from(), this.to());
}

/**
 * string representation
 * @return {string} the string representation of this interval
 */
Interval.prototype.toString = function(){
	return "[ "+ this.from().toFixed(3) + ", " + this.to().toFixed(3) +" ]";
}

// STATICS

/**
 * creates an interval from its center and radius
 * @param {number} c the center
 * @param {number} r the radius
 * @return {Interval} the interval
 */
Interval.fromCenter = function(c, r){
	return new Interval(c-r, c+r);
}

/**
 * creates an interval from 0 to 1
 * @return {Interval} the interval from 0 to 1
 */
Interval.unity = function(){
	return new Interval(0, 1);
}


/**
 * creates an interval from -1 to 1
 * @return {Interval} the interval from -1 to 1
 */
Interval.signedUnity = function(){
	return new Interval(-1, 1);
}


/**
 * creates an interval from 0 to 255
 * @return {Interval} the interval from 0 to 255
 */
Interval.bit8 = function(){
	return new Interval(0, 256 -1);
}


/**
 * creates an interval from 0 to 65535
 * @return {Interval} the interval from 0 to 65535
 */
Interval.bit16 = function(){
	return new Interval(0, 256*256 -1);
}

/**
 * creates an interval from 0 to 4294967295
 * @return {Interval} the interval from 0 to 4294967295
 */
Interval.bit32 = function(){
	return new Interval(0, 256*256*256*256 -1);
}

/**
 * creates an interval from 0 to 2^64-1
 * @return {Interval} the interval from 0 to 2^64-1
 */
Interval.bit64 = function(){
	return new Interval(0, 256*256*256*256 * 256*256*256*256 -1);
}

/**
 * creates an interval from -PI to +PI
 * @return {Interval} the interval from -PI to +PI
 */

Interval.circle = function(){
	return new Interval(-Math.PI, Math.PI);
};
/**
 * creates an interval from 0 to 2PI
 * @return {Interval} the interval from 0 to 2PI
 */

Interval.circlePositive = function(){
	return new Interval(0, 2*Math.PI);
};

/**
 * creates an interval from -2PI to 0
 * @return {Interval} the interval from -2PI to 0
 */
Interval.circleNegative = function(){
	return new Interval(-2*Math.PI, 0);
};

/**
 * creates an interval from -180 to 180
 * @return {Interval} the interval from -180 to 180
 */
Interval.circleDegree = function(){
	return new Interval(-180, 180);
};

/**
 * creates an interval from 0 to 360
 * @return {Interval} the interval from 0 to 360
 */
Interval.circleDegreePositive = function(){
	return new Interval(0, 360);
};
/**
 * creates an interval from -360 to 0
 * @return {Interval} the interval from -360 to 0
 */
Interval.circleDegreeNegative = function(){
	return new Interval(0, -360);
};

/**
 * iterate a callback over the interval (by step)
 * @param {function} cb the callback function wich is passed the current step
 * @param {number} inc_abs the absolute incerement to iterate by (defaults to 1)
 */

Interval.prototype.iterate = function(cb, inc_abs){
	inc_abs = Math.abs(inc_abs) || 1;
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


/**
 * return the different numbers boun dto a division (remainder...)
 * @param {number} x the number to divide
 * @param {number} x the number to divide by
 * @return {object} with key: divided, divisor, remain, value, and cliped
 */
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
