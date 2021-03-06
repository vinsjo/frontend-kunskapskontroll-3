/**
 * Get a number between 1 and 9 as a word
 *
 * @param {Number} number
 * @returns {String}
 */
function numberWord(number) {
	const words = [
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
	];
	const index = (number < 1 ? 1 : number > 9 ? 9 : number) - 1;
	return words[index];
}
/**
 * Get a string where all characters is lowerCase except the first
 *
 * @param {String} string
 * @returns {String}
 */
function firstCharToUpper(string) {
	return (
		string.substring(0, 1).toUpperCase() +
		string.substring(1, string.length).toLowerCase()
	);
}
export { numberWord, firstCharToUpper };
