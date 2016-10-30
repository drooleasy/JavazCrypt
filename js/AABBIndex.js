function AABBIndex(){
	this.hIndex = new IntervalIndex();
	this.vIndex = new IntervalIndex();
}

AABBIndex.prototype.add = function(aabb){
	var hInterval = new Interval(aabb.x, aabb.x+aabb.w);
	hInterval.aabb = aabb;
	var vInterval = new Interval(aabb.y, aabb.y+aabb.h);
	vInterval.aabb = aabb;
	this.hIndex.add(hInterval);
	this.vIndex.add(vInterval);
}


AABBIndex.prototype.remove = function(aabb){
	var hInterval = new Interval(aabb.x, aabb.x+aabb.w);
	hInterval.aabb = aabb;
	var vInterval = new Interval(aabb.y, aabb.y+aabb.h);
	vInterval.aabb = aabb;
	this.hIndex.remove(hInterval);
	this.vIndex.remove(vInterval);
}

AABBIndex.prototype.get = function(aabb){
	var vMatches = this.hIndex.get(aabb.x, aabb.x+aabb.w);
	var hMatches = this.vIndex.get(aabb.y, aabb.y+aabb.h);
	var res = [];
	for(var i=0; i< vMatches.length; i++){
		var candidateAABB = vMatches[i].aabb;
		for(var j=0; j< hMatches.length; j++){
			if(hMatches[j].aabb === candidateAABB){
				res.push(candidateAABB)
			}
		}
	}
	return res;
}

/*
var a = new AABB(10, 10, 40, 40);
var b = new AABB(5, 5, 20, 20);
var c = new AABB(54, 50, 40,40);
var idx = new AABBIndex();
idx.add(a);
idx.add(b);
idx.add(c);
idx.get(new AABB(0,0,55,55)).length
*/
