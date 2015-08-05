
function randomDelta(delta, p){
	p = p || 2;
	var s = Math.random() > .5 ? -1 : 1;
	return s * Math.pow(Math.random(), p) * delta;
}



function randomTowardLeft(p){ // bias : 0, .5,  1
	p = p || 2;
	var r = Math.random(),
		s = 1;
	r = Math.pow(r, p);
	return 0 + s * r;
}


function randomTowardRight(p){ // bias : 0, .5,  1
	p = p || 2; 
	var r = Math.random(),
		s = -1;
	r = Math.pow(r, p);
	return 1 + s * r;
}


function randomTowardCenter(p){ // bias : 0, .5,  1
	p = p || 2; 
	var r = Math.random(),
		s = Math.random()>.5 ? 1 : -1;
	r = Math.pow(r, p) / Math.pow(2,p-1);
	
	return .5 + s * r;
}

function randomBiased(bias, p){
	p = p || 2; 
	if(bias == 0) return randomTowardCenter(p);
	else if(bias > 0) return randomTowardRight(p);
	else return randomTowardLeft(p);
}


function test(){

	var n = 1000;
	var left =0,
		center = 0,
		right = 0,
		bias = 2;
	for(var i=0; i<n; i++){
	   left+= randomBiased(-1, bias);
	   center+= randomBiased(0, bias);
	   right+= randomBiased(1, bias);
	}
	console.log("left: " + left/n);
	console.log("centert: "+center/n);
	console.log("right: " + right/n);
	
}
