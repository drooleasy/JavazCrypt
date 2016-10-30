function IntervalIndex(){
	this.index = [];
}
IntervalIndex.prototype.add = function add(interval){
	min = interval.min();
	max = interval.max();
	this.index[min] = this.index[min] || {starts:[], ends:[]};
	this.index[min].starts.push(interval);
	this.index[max] = this.index[max] || {starts:[], ends:[]};
	this.index[max].ends.push(interval);
}

IntervalIndex.prototype.remove = function remove(interval){
	var min = interval.min(),
		max = interval.max();
	if(this.index[min]){ 
		for(i=0;i<this.index[min].starts.length;i++){
			if(this.index[min].starts[i] === interval) delete this.index[min].starts[i];
			if(this.index[min].starts.length == 0 && this.index[min].ends.length == 0) delete this.index[min];  
		}
	}
	
	if(this.index[max]){ 
		for(i=0;i<this.index[max].ends.length;i++){
			if(this.index[max].ends[i] === interval) delete this.index[max].ends[i];
			if(this.index[max].starts.length == 0 && this.index[maw].ends.length == 0) delete this.index[max]; 
		}
	}
}

IntervalIndex.prototype.get = function get(from, to){
	var intervals = [];
	for(var i=from; i<=to; i++){
		if(this.index[i]){
			for(var j=0; j<this.index[i].starts.length; j++){
				intervals.push(this.index[i].starts[j])
			}
			for(var j=0; j<this.index[i].ends.length; j++){
				var inter = this.index[i].ends[j];
				if(inter.min()<from) { // avoid duplicates
					intervals.push(inter);
				}
			}
		}
	}
	return intervals;
}
