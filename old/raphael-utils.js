// http://stackoverflow.com/questions/12828418/drawing-a-filled-180deg-arc-in-raphael			
// http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
Raphael.fn.arc = function(startX, startY, endX, endY, radius1, radius2, angle) {
	var arcSVG = [radius1, radius2, angle, 0, 1, endX, endY].join(' ');
	return " a " + arcSVG;
};

Raphael.fn.circularArc = function(centerX, centerY, radius, startAngle, endAngle) {
	var startX = centerX+radius*Math.cos(startAngle); 
	var startY = centerY+radius*Math.sin(startAngle);
	var endX = centerX+radius*Math.cos(endAngle); 
	var endY = centerY+radius*Math.sin(endAngle);
	return this.arc(startX, startY, endX-startX, endY-startY, radius, radius, 0);
};


var cone = function (x, y, r, a, w){
		
	var x1 = x + Math.cos(a - w/2) * r,
		y1 = y + Math.sin(a - w/2) * r;
			
	return "M" + x + " " + y
		+ "L" + x1 + " " + y1
		+ paper.circularArc(x,y, r, a-w/2, a+w/2)
		+ "L" + x + " " + y;
};

function circle (x, y, r, a){
		
	var x1 = x + Math.cos(a) * r,
		y1 = y + Math.sin(a) * r;
		
	return "M" + x + " " + y
		+ "L" + x1 + " " + y1
		+ paper.circularArc(x,y, r, a, a+deg2rad(180))
		+ paper.circularArc(x,y, r, a+deg2rad(180), a)
		+ "L" + x + " " + y;
};
		



// http://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function polarToCartesian(centerX, centerY, radius, angle) {
  
  return {
    x: centerX + (radius * Math.cos(angle)),
    y: centerY + (radius * Math.sin(angle))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var arcSweep = clipAnglePositive(endAngle - startAngle) <= Math.PI ? "0" : "1";

    var d = [
        " A", radius, radius, 0, arcSweep, 0, end.x, end.y
    ].join(" ");

    return d;       
}
