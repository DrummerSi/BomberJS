module Bomberman {

	export class Point {

		constructor(public x = 0, public y = 0) {}

		/**
		 * Returns true if pt equals current point
		 */
		public equalTo(pt: Point) {
			return (this.x === pt.x && this.y == pt.y);
		}

		/**
		 * Returns the difference between pt and current point
		 */
		public difference(pt: Point) {
			return new Point(pt.x - this.x, pt.y - this.y);
		}

		public pTheorem(pt: Point) {
			return Math.floor(Math.sqrt(((pt.x - this.x) * (pt.x - this.x)) + ((pt.y - this.y) * (pt.y - this.y))));
		}

		public radiusDistance(pt: Point) {
			let dx = pt.x - this.x;
			dx *= dx;
			let dy = pt.y - this.y;
			dy *= dy;
			return Math.sqrt(dx + dy);
		}

		/**
		 * Returns a new copy of the current point
		 */
		public clone() {
			return new Point(this.x, this.y);
		}

		/**
		 * Returns a point that is the mirror opposite of the current point
		 */
		public boardOpposite() {
			let x, y = 0;

			if (this.x < 9) {
				x = 18 - this.x;
			} else if (this.x > 9) {
				x = this.x - 9;
			} else if(this.x === 9){
				x = 9;
			}

			if (this.y < 6) {
				y = 12 - this.y;
			} else if (this.y > 6) {
				y = this.y - 6;
			} else if (this.y === 6) {
				y = 6;
			}

			x = 18 - this.x;
			y = 12 - this.y;

			return new Point(x, y);
		}

		/**
		 * Returns a point that exactly 1 tile away in given direction
		 */
		public moveDirection(dir: Direction) {
			let dirX = 0, dirY = 0;
			if (dir === Direction.Right) {
				dirX = 1;
			} else if (dir === Direction.Left) {
				dirX = -1;
			} else if (dir === Direction.Down) {
				dirY = 1;
			} else if (dir === Direction.Up) {
				dirY = -1;
			}

			return new Point(this.x + dirX, this.y + dirY);
		}

	}

}
