
function Rect(x,y,w,h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
}

Rect.prototype.getPoint = function (i,j){
	
	var ii, jj;
	
	if(i=="left") 	ii=0;
	else if(i=="center") ii=0.5;
	else if(i=="right") 	ii=1;
	else ii = i

	if(j=="top") 	jj=0;
	else if(j=="center") jj=0.5;
	else if(j=="bottom") jj=1;
	else jj = j;
	
	return {
		x: this.x + ii * this.w, 
		y: this.y + jj * this.h 
	};
}


Rect.prototype.getPointFromCenter = function(i,j){
	
	if(i=="left") i = -1;
	if(i=="center") i = 0;
	if(i=="right") i = 1;

	if(j=="top") j = -1;
	if(j=="center") j = 0;
	if(j=="bottom") j = 1;

	var center = this.getPoint("center", "center");
	
	return {
		x: center.x + i * this.w, 
		y: center.y + j * this.h 
	};
}

Rect.prototype.verticals = function() { 
	return [
		[ [this.x, this.y], [this.x,this.y+this.h] ],
		[ [this.x+this.w, this.y], [this.x+this.w,this.y+this.h] ]
	];
}
Rect.prototype.horizontals = function() { 
	return [
		[ [this.x, this.y], [this.x+this.w, this.y] ],
		[ [this.x, this.y+this.h], [this.x+this.w, this.y+this.h] ]
	];
}
Rect.prototype.diagonals = function() { 
	return [
		[ [this.x, this.y], [this.x+this.w, this.y+this.h] ],
		[ [this.x, this.y+this.h], [this.x+this.w, this.y] ]
	];
}

Rect.prototype.isVertical = function(){
	return this.h > this.w;
}
Rect.prototype.isHorizontal = function(){
	return this.w > this.h;
}
Rect.prototype.isSquare = function(){
	return this.w == this.h;
}
