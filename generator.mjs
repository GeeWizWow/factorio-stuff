export const CircleModes = {
	thick: 'thick',
	thin: 'thin',
	filled: 'filled',
}

function distance(x, y, ratio) {
	return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x, 2));
}

function filled(x, y, radius, ratio) {
	return distance(x, y, ratio) <= radius;
}

function fatfilled(x, y, radius, ratio, thickness) {
	return filled(x, y, radius, ratio) && !(
		filled(x + thickness, y, radius, ratio) &&
		filled(x - thickness, y, radius, ratio) &&
		filled(x, y + thickness, radius, ratio) &&
		filled(x, y - thickness, radius, ratio) &&
		filled(x + thickness, y + thickness, radius, ratio) &&
		filled(x + thickness, y - thickness, radius, ratio) &&
		filled(x - thickness, y - thickness, radius, ratio) &&
		filled(x - thickness, y + thickness, radius, ratio)
	);
}

function thinfilled(x, y, radius, ratio) {
	return filled(x, y, radius, ratio) && !(
		filled(x + 1, y, radius, ratio) &&
		filled(x - 1, y, radius, ratio) &&
		filled(x, y + 1, radius, ratio) &&
		filled(x, y - 1, radius, ratio)
	);
}


export class Circle  {

    width;
    height;
    mode;
    force;
    thickness;

	constructor({
	    width, 
	    height, 
	    mode, 
	    thickness = 1,
	    force = true,
    }) {
        this.width = width;
	    this.height = height;
	    this.mode = mode;
	    this.force = force;
	    this.thickness = thickness;
	}

	getBounds() {
		return {
			minX: 0,
			maxX: this.width,

			minY: 0,
			maxY: this.height,
		};
	}

	isFilled(x, y) {
		const bounds = this.getBounds();

		x = -.5 * (bounds.maxX - 2 * (x + .5));
		y = -.5 * (bounds.maxY - 2 * (y + .5));

		switch (this.mode) {
			case CircleModes.thick: {
				return fatfilled(x, y, (bounds.maxX / 2), bounds.maxX / bounds.maxY, this.thickness);
			}
			case CircleModes.thin: {
				return thinfilled(x, y, (bounds.maxX / 2), bounds.maxX / bounds.maxY);
			}
			default: {
				return filled(x, y, (bounds.maxX / 2), bounds.maxX / bounds.maxY);
			}
		}
	}

	getDescription() {
		return `${this.mode} circle ${this.width}x${this.height}`;
	}
}