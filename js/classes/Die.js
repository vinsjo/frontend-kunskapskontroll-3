export default class Die {
	/**
	 * @param {SVGSVGElement} element
	 */
	constructor(element) {
		this.element = element;
	}
	/**
	 * @property {Boolean} isLocked - if the die is locked or not
	 */
	get isLocked() {
		return this.element.classList.contains('locked');
	}
	set isLocked(locked) {
		locked
			? this.element.classList.add('locked')
			: this.element.classList.remove('locked');
	}
	/**
	 * @property {Number} value - gets die-value or sets die-value and updates
	 * which dots are shown based on the value
	 */
	get value() {
		return parseInt(this.element.dataset.value);
	}
	set value(value) {
		this.element.dataset.value = `${value}`;
		const dots = [...this.element.querySelectorAll('.dice-dot')];
		if (!dots.length) return;
		const visibleDots = [];
		// middle dot, if number is uneven
		if (value % 2 !== 0) visibleDots.push(3);
		// bottom left and top right dot
		if (value > 1) visibleDots.push(1, 5);
		// top left and bottom right dot
		if (value > 3) visibleDots.push(0, 6);
		// middle left and middle right, only if value is 6
		if (value === 6) visibleDots.push(2, 4);

		dots.forEach((dot, index) => {
			visibleDots.includes(index)
				? (dot.style.opacity = 1)
				: (dot.style.opacity = 0);
		});
	}
	/**
	 * if die-object is not locked, set a new random value
	 *
	 * @returns {Number} - die value
	 * @see {@link Die.value}
	 */
	roll() {
		if (!this.isLocked) this.value = Math.ceil(Math.random() * 6);
		return this.value;
	}
}
