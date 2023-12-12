/**
 * String of all letters
 *
 */
const LETTER_LIST = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * String of all numbers
 *
 */
const NUMBER_LIST = '0123456789';

/**
 * String of all symbols
 */
const SYMBOL_LIST = '~`!@#$%^&*()_-+={[}]|\\:;"\'<,>.?/';

/**
 * String of all letters, numbers & symbols
 */
const CHAR_LIST = LETTER_LIST + NUMBER_LIST + SYMBOL_LIST;

export function formatPhoneNumber(number: string) {
	const parts = /(\+?1)?.*?(\d{3}).*?(\d{3}).*?(\d{4})/g.exec(number);
	if(!parts) throw new Error(`Number cannot be parsed: ${number}`);
	return `${parts[1] ?? ''} (${parts[2]}) ${parts[3]}-${parts[4]}`.trim();
}

/**
 * Insert a string into another string at a given position
 *
 * @example
 * ```
 * console.log(insertAt('Hello world!', ' glorious', 5);
 * // Output: Hello glorious world!
 * ```
 *
 * @param {string} target - Parent string you want to modify
 * @param {string} str - Value that will be injected to parent
 * @param {number} index - Position to inject string at
 * @returns {string} - New string
 */
export function insertAt(target: string, str: string, index: number): String {
	return `${target.slice(0, index)}${str}${target.slice(index + 1)}`;
}

/**
 * Generate a string of random characters.
 *
 * @example
 * ```ts
 * const random = randomString();
 * const randomByte = randomString(8, "01")
 * ```
 *
 * @param {number} length - length of generated string
 * @param {string} pool - character pool to generate string from
 * @return {string} generated string
 */
export function randomString(length: number, pool: string = CHAR_LIST): string {
	return Array(length).fill(null).map(() => {
		const n = ~~(Math.random() * pool.length);
		return pool[n];
	}).join('');
}

/**
 * Generate a random string with fine control over letters, numbers & symbols
 *
 * @example
 * ```ts
 * const randomLetter = randomString(1, true);
 * const randomChar = randomString(1, true, true, true);
 * ```
 *
 * @param {number} length - length of generated string
 * @param {boolean} letters - Add letters to pool
 * @param {boolean} numbers - Add numbers to pool
 * @param {boolean} symbols - Add symbols to pool
 * @return {string} generated string
 */
export function randomStringBuilder(length: number, letters = false, numbers = false, symbols = false): string {
	if(!letters && !numbers && !symbols) throw new Error('Must enable at least one: letters, numbers, symbols');
	return Array(length).fill(null).map(() => {
		let c;
		do {
			const type = ~~(Math.random() * 3);
			if(letters && type == 0) {
				c = LETTER_LIST[~~(Math.random() * LETTER_LIST.length)];
			} else if(numbers && type == 1) {
				c = NUMBER_LIST[~~(Math.random() * NUMBER_LIST.length)];
			} else if(symbols && type == 2) {
				c = SYMBOL_LIST[~~(Math.random() * SYMBOL_LIST.length)];
			}
		} while(!c);
		return c;
	}).join('');
}

/**
 * Find all substrings that match a given pattern.
 *
 * Roughly based on `String.prototype.matchAll`.
 *
 * @param {string} value - String to search.
 * @param {RegExp | string} regex - Regular expression to match.
 * @return {RegExpExecArray[]} Found matches.
 */
export function matchAll(value: string, regex: RegExp | string): RegExpExecArray[] {
	if(typeof regex === 'string') {
		regex = new RegExp(regex, 'g');
	}

	// https://stackoverflow.com/a/60290199
	if(!regex.global) {
		throw new TypeError('Regular expression must be global.');
	}

	let ret: RegExpExecArray[] = [];
	let match: RegExpExecArray | null;
	while((match = regex.exec(value)) !== null) {
		ret.push(match);
	}

	return ret;
}

/**
 * Check if email is valid
 *
 * @param {string} email - Target
 * @returns {boolean} - Follows format
 */
export function validateEmail(email: string) {
	return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}
