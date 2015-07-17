function Shadow(path){
	this.path = path;
	this.style = {
		"fill" : "#000",
		"stroke" : "#000",
		"stroke-width" : 0
	};
	this.element = null;
}

Shadow.prototype.draw = function (paper){
	this.element = paper.path(this.path).attr(this.style);
}
