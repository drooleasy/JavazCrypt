
function drawRoundedRect(ctx, x, y, w, h){
	
	var rect = new Rect(x,y,w,h);
		
	var top_left = rect.getPoint("left", "top");
	var top_right = rect.getPoint("center", "top");
	var bottom_right = rect.getPoint("center", "center");
	var bottom_left = rect.getPoint("left", "center");
	
	var radius = Math.min(w, h)/2
	
	ctx.moveTo(bottom_left.x, bottom_left.y);
	ctx.arcTo(
		top_left.x, 						top_left.y, 
		top_right.x, 						top_right.y, 
		radius
	);
	ctx.arcTo( 
		top_right.x + w/2, 					top_right.y,
		top_right.x + w/2, 					top_right.y + h/2,    
		radius
	);
	ctx.arcTo(
		bottom_right.x + w/2,			 	bottom_right.y + h/2,  
		bottom_right.x, 					bottom_right.y + h/2, 
		radius
	);
	ctx.arcTo(
		bottom_left.x, 						bottom_left.y + h/2,  
		bottom_left.x, 						bottom_left.y, 
		radius
	);
	
	
	
}
