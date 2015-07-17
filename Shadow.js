function Shadow(){
	this.paths = [];
	this.style = {
		"fill" : "#000",
		"stroke" : "#000",
		"stroke-width" : 0,
		"fill-opacity" : 1
	};
	this.element = null;
}

Shadow.prototype.clear = function (paper){
	this.paths = [];
}
Shadow.prototype.draw = function (paper){
	var path = "";
	for(var i = 0; i<this.paths.length;i++) path += " " + this.paths[i];
	this.element = paper.path(path).attr(this.style);
}
