
function Handle(x,y,r, onMove){
	this.x=x;
	this.y=y;
	this.r=r;
	this.styles={
		"fill":"#fff",
		"stroke":"fff",
		"text":"#fff"
	};
	
	this.onMove = onMove;
	
	this.onMouseOver = function(){
		this.styles.fill = "#f33";
		this.styles.text = "#f33";
	}
	
	this.onMouseOut = function(){
		this.styles.fill = "#fff";
		this.styles.text = "#fff";
	}
	this.label = "";
}


Handle.prototype.draw = function(paper){
	var ctx = paper.getContext("2d");
	ctx.fillStyle = this.styles.fill;
	ctx.strokeStyle = this.styles.stroke;
	ctx.beginPath();

	ctx.arc(this.x, this.y, this.r, 0, PIPI);
	ctx.fill();
	ctx.stroke();
	
	if(this.label){

		var text_x = this.x + this.r + 8;
		var text_y = this.y + 4;
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		
		ctx.strokeStyle = this.styles.text;
		ctx.lineWidth = 1; 
		ctx.beginPath();
		ctx.arc(text_x+3, text_y-4, 7, 0, PIPI);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = this.styles.text; 
		ctx.fillText(
			this.label,
			text_x, 
			text_y
		);
		
	}
}
