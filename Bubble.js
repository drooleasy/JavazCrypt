Bubble = {};


Bubble.style = {
	margin:5,
	"fill":"#FFF",
	"stroke":"#FFF",
	"stroke-width":1,
	"text-fill":"#000"
}

Bubble.draw = function (paper, x,y, msg, bob){
	var margin = Bubble.style.margin,
		height = 14,
		lineHeight = 9;
	
	var metrics = ctx.measureText(msg);

	var bubble_width = metrics.width + 2 * margin;
	var bubble_height = height + 2 * margin;


	var bubble_x = x;
	var bubble_y = y - height - margin;

	var text_x = bubble_x + margin;
	var text_y = bubble_y + margin + lineHeight;



	ctx.fillStyle =  Bubble.style["fill"];
	ctx.strokeStyle = Bubble.style["stroke"];
	ctx.lineWidth = Bubble.style["stroke-width"];
	ctx.fontColor = Bubble.style["font-color"];
	
	var anchor = new Segment(
		bubble_x+bubble_width/2,
		bubble_y+bubble_height/2,
		bob.x + bob.width + 2,
		bob.y - bob.width - 2
	);
	
	anchor.draw(paper);

	drawRoundedRect(ctx, bubble_x, bubble_y, bubble_width, bubble_height);

	ctx.fill();
	ctx.stroke();

	
	ctx.fillStyle = Bubble.style["text-fill"]; 
	ctx.fillText(
		msg,
		text_x, 
		text_y
	);
	
}













function drawRoundedRect(ctx, x, y, w, h){
	
	var rec = {
		x:x, 
		y:y, 
		w:w, 
		h:h
	};
	
	
	var top_left = {
		x:rec.x, 
		y:rec.y, 
		w:rec.w/2, 
		h:rec.h/2
	}
	
	
	var top_right = {
		x:rec.x + rec.w/2, 
		y:rec.y, 
		w:rec.w/2, 
		h:rec.h/2
	}
	
	
	var bottom_right = {
		x:rec.x + rec.w/2, 
		y:rec.y + rec.h/2, 
		w:rec.w/2, 
		h:rec.h/2
	}
	
	var bottom_left = {
		x:rec.x, 
		y:rec.y + rec.h/2, 
		w:rec.w/2, 
		h:rec.h/2
	}
	
	var radius = Math.min(rec.w,rec.h)/2
	
	ctx.moveTo(bottom_left.x, bottom_left.y);
	ctx.arcTo(
		top_left.x, top_left.y, 
		top_right.x, top_right.y, 
		radius
	);
	ctx.arcTo( 
		top_right.x + top_right.w, top_right.y,
		top_right.x + top_right.w, top_right.y + top_right.h,    
		radius
	);
	ctx.arcTo(
		bottom_right.x + bottom_right.w, bottom_right.y + bottom_right.h,  
		bottom_right.x, bottom_right.y + bottom_right.h, 
		radius
	);
	ctx.arcTo(
		bottom_left.x, bottom_left.y + bottom_left.h,  
		bottom_left.x, bottom_left.y, 
		radius
	);
	
	
	
}
