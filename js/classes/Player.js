import Die from './Die.js';
import ScoreTableCell from './ScoreTableCell.js';
import { calculateDiceScore } from '../functions/calculations.js';

/**
 * Class used for the game's players
 */
export default class Player {
	/**
	 * @param {String} id
	 * @param {String} name
	 * @param {ScoreTableCell[]} tableColumn
	 * @param {Die[]} dice
	 *
	 * @see {@link ScoreTableCell}
	 * @see {@link Die}
	 */
	constructor(id, name, tableColumn, dice) {
		this.id = id;
		this.name = name;
		this.column = tableColumn;
		this.rollsLeft = 3;
		this.dice = dice;
		this.isRolling = false;
		this.type = 'human';

		const reduceSection = section => {
			return section.reduce((sum, cell) => {
				const val = cell.value;
				return sum + (typeof val === 'number' ? val : 0);
			}, 0);
		};
		const sections = {
			upper: this.column.filter(cell => cell.section === 'upper'),
			lower: this.column.filter(cell => cell.section === 'lower'),
			sum: this.column.filter(cell => cell.section === 'sum'),
			total: this.column.filter(cell => cell.row === 'total'),
		};
		const score = {
			get upper() {
				return reduceSection(sections.upper);
			},
			get lower() {
				return reduceSection(sections.lower);
			},
			get bonus() {
				return this.upper >= 63 ? 50 : 0;
			},
			get total() {
				return this.upper + this.lower + this.bonus;
			},
		};
		this.sections = sections;
		this.score = score;
	}
	/**
	 * @property {ScoreTableCell[]} availableCells - an array of all cells in
	 * player's column that is empty
	 */
	get availableCells() {
		return this.column.filter(
			cell =>
				cell.value === null &&
				cell.section !== 'sum' &&
				cell.row !== 'total'
		);
	}
	/**
	 * @property {Number[]} - get dice-values
	 * @see {@link Player.dice}
	 */
	get diceValues() {
		return this.dice.map(die => die.value);
	}
	/**
	 * @property {Object[]} - gets current dice-score in available cells
	 * and available options
	 */
	get diceScore() {
		const available = this.availableCells;
		const diceScore = calculateDiceScore(this.diceValues);
		const options = available.filter(cell => {
			return diceScore[cell.scoreKey] !== 0;
		});
		return [diceScore, options];
	}
	/**
	 * Reset the state of each cell in Players column, removes click-event
	 * listeners and removes value if cell is not disabled (occupied)
	 * @see {@link Player.column}
	 * @see {@link ScoreTableCell.removeClickListener}
	 */
	resetColumnState() {
		this.column.forEach(cell => {
			cell.element.classList.remove('current');
			cell.element.classList.remove('option');
			cell.element.classList.remove('disable');
			cell.removeClickListener();
			if (!cell.disabled) {
				cell.value = null;
			}
		});
	}
	/**
	 * Updates Player's column by adding classname "current" to all cell-elements
	 */
	setCurrent() {
		this.column.forEach(cell => {
			cell.element.classList.add('current');
		});
	}
	/**
	 * Updates Player's column by adding classname "winner" to all cell-elements
	 */
	setWinner() {
		this.column.forEach(cell => {
			cell.element.classList.add('winner');
		});
	}
	/**
	 * Displays sum of all cells in the upper section of Player's column and also
	 * displays the bonus-score
	 */
	displaySum() {
		const cells = this.sections.sum;
		cells.forEach(cell => {
			if (cell.row === 'upper-sum') {
				cell.element.textContent = this.score.upper;
				return;
			}
			cell.element.textContent = this.score.bonus;
		});
	}
	/**
	 * Displays the Player's total score in scoreTable;
	 */
	displayTotal() {
		this.sections.total[0].element.textContent = this.score.total;
	}
	/**
	 * Updates all values in Player's Die-array and returns all values
	 * @returns {Number[]}
	 * @see {@link Die.roll}
	 */
	roll() {
		return this.dice.map(die => die.roll());
	}
	/**
	 * Animate roll of dice, async in order to be able to wait for it to finish
	 *
	 * @param {Function} [onCellSelect] - callback used in eventlistener added to
	 * cells in scoreTable
	 *
	 * @see {@link Die}
	 * @see {@link Player.dice}
	 * @see {@link Player.column}
	 */
	async animatedRoll(onCellSelect = null, interval = 60, timeout = 500) {
		const dice = this.dice.filter(die => !die.isLocked);
		if (!dice.length || this.isRolling || this.rollsLeft < 1) {
			return this.diceValues;
		}
		this.rollsLeft--;
		this.isRolling = true;

		const randomOffset = max => {
			return Math.round(Math.random() * max * 2) - max;
		};

		dice.forEach(die => {
			die.element.style.transition = `transform ${interval / 2} linear`;
		});

		let intervalID = setInterval(() => {
			dice.forEach(die => {
				const x = randomOffset(4),
					y = randomOffset(4),
					deg = randomOffset(8);
				die.element.style.transform = `translate(${x}px,${y}px) rotate(${deg}deg)`;
				die.roll();
			});
		}, interval);

		await new Promise(resolve => {
			setTimeout(() => {
				clearInterval(intervalID);
				dice.forEach(die => {
					die.element.style.transform = null;
					die.element.style.transition = null;
				});
				this.isRolling = false;
				resolve(this.roll());
			}, timeout);
		});

		this.resetColumnState();
		this.setCurrent();
		const [diceScore, options] = this.diceScore;

		const getListener = (cell, value) => {
			return () => {
				cell.value = value;
				this.resetColumnState();
				if (onCellSelect) return onCellSelect(this, cell);
			};
		};
		if (!options.length && this.rollsLeft < 1) {
			this.availableCells.forEach(cell => {
				cell.setTempValue(cell.disabledValue);
				cell.element.classList.add('disable');
				cell.setClickListener(getListener(cell, cell.disabledValue));
			});
		} else {
			options.forEach(cell => {
				const value = diceScore[cell.scoreKey];
				cell.setTempValue(value);
				cell.element.classList.add('option');
				cell.setClickListener(getListener(cell, value));
			});
		}
		return [diceScore, options];
	}
}
