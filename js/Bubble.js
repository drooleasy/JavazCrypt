Bubble = {};


Bubble.style = {
	"margin": 5,
	"padding": 3,
	"line-height": 11,
	"fill": "#FFF",
	"stroke": "#FFF",
	"stroke-width": 1,
	"text-fill": "#000",
	minAnchorLength : 5
}

Bubble.draw = function (paper, msg, angle, offset) {
	var anchor_start_x = Math.cos(angle) * offset,
		anchor_start_y = Math.sin(angle) * offset;

	var lines = msg.split("\n");
	var longestLine = "";
	for(var i=0;i<lines.length;i++){
		if(lines[i].length > longestLine.length) longestLine = lines[i];
	} 
	
	var margin = Bubble.style.margin;		
	var padding = Bubble.style.padding;		
	
	var content_height = 2*Bubble.style.padding + Bubble.style["line-height"] * lines.length;
	
	var metrics = ctx.measureText(longestLine);

	var bubble_width = metrics.width + 2*margin + 2*padding;
	var bubble_height = content_height + 2*margin + 2*padding;

	var min_anchor = Bubble.style.minAnchorLength,
		maxLength = Math.max(bubble_width, bubble_height),
		bubble_center_x = anchor_start_x + Math.cos(angle)*(min_anchor + maxLength/2),
		bubble_center_y = anchor_start_y + Math.sin(angle)*(min_anchor + maxLength/2),
		bubble_x = bubble_center_x - bubble_width/2,
		bubble_y = bubble_center_y - bubble_height/2;

	var text_x = bubble_x + margin + padding;
	var text_y = bubble_y + margin + padding + Bubble.style["line-height"];



	ctx.fillStyle   = Bubble.style["fill"];
	ctx.strokeStyle = Bubble.style["stroke"];
	ctx.lineWidth   = Bubble.style["stroke-width"];
	ctx.fontColor   = Bubble.style["font-color"];
	
	var anchor = new Segment(
		bubble_center_x,
		bubble_center_y,
		anchor_start_x,
		anchor_start_y
	);
	
	anchor.draw(paper);

	drawRoundedRect(ctx, bubble_x, bubble_y, bubble_width, bubble_height);

	ctx.fill();
	ctx.stroke();

	
	ctx.fillStyle = Bubble.style["text-fill"]; 
	for(var i=0; i<lines.length;i++){
		ctx.fillText(
			lines[i],
			text_x, 
			text_y + i * Bubble.style["line-height"]
		);
	}
}

