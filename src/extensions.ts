/*************************************************************
 * Typescript extensions
 *************************************************************/

//Extend window
interface Window {
	mainMenu: any
}

//Extend jQuery
interface JQuery {
	PopupLayer: any;
}

//Extend Array
interface Array<T> {
	multiplyBy(o: T, i: number): Array<T>;
	multiplyByPlayer(o: T): Array<T>;
}


/*************************************************************
 * Javascript extensions
 *************************************************************/

//Multiplies values in array by factor
Array.prototype.multiplyBy = function (multiply: number, factor = 1) {
	let output = [];
	for (let out of this) {
		output.push(out + (multiply * factor));
	}
	return output;
}

//Multiplies values in array based on player colour
Array.prototype.multiplyByPlayer = function (colour: number) {
	let output = [];
	for (let out of this) {
		output.push(out + (colour * 24)); //24 = Number of frames each player has
	}
	return output;
}
