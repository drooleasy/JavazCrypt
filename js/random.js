/**
 * return a random in range centered on 0, with a bias toward 0
 * @param {number} delta the range (result goes from -range/2 to range/2)
 * @param {number} p the bias (default to 2, 1 for no bias, the greater the numbe rthe greater the bias)
 * @return {number} the random number between -range/2 and range/2
 */
function randomDelta(delta, p){
	p = p || 2;
	var s = Math.random() > .5 ? -1 : 1;
	return s * Math.pow(Math.random(), p) * delta;
}


/**
 * return a random number between 0 and 1 with a bias toward 0
 * @param {number} p the bias (default to 2, 1 for no bias, the greater the numbe rthe greater the bias)
 * @return {number} the random number between 0 and 1
 */
function randomTowardLeft(p){ // bias : 0, .5,  1
	p = p || 2;
	var r = Math.random(),
		s = 1;
	r = Math.pow(r, p);
	return 0 + s * r;
}


/**
 * return a random number between 0 and 1 with a bias toward 1
 * @param {number} p the bias (default to 2, 1 for no bias, the greater the numbe rthe greater the bias)
 * @return {number} the biased random number between 0 and 1
 */
function randomTowardRight(p){ // bias : 0, .5,  1
	p = p || 2;
	var r = Math.random(),
		s = -1;
	r = Math.pow(r, p);
	return 1 + s * r;
}


/**
 * return a random number between 0 and 1 with a bias toward .5
 * @param {number} p the bias (default to 2, 1 for no bias, the greater the numbe rthe greater the bias)
 * @return {number} the biased random number between 0 and 1
 */
function randomTowardCenter(p){ // bias : 0, .5,  1
	p = p || 2;
	var r = Math.random(),
		s = Math.random()>.5 ? 1 : -1;
	r = Math.pow(r, p) / Math.pow(2,p-1);

	return .5 + s * r;
}


/**
 * return a random number between 0 and 1 with a bias toward 0
 * @param {number} p the bias orientation -1: to left (0), 0:centered (.5), 1: to right (1)
 * @param {number} p the bias (default to 2, 1 for no bias, the greater the numbe rthe greater the bias)
 * @return {number} the random number between 0 and 1
 */
function randomBiased(bias, p){
	p = p || 2;
	if(bias == 0) return randomTowardCenter(p);
	else if(bias > 0) return randomTowardRight(p);
	else return randomTowardLeft(p);
}
