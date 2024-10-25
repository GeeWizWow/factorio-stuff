import clipboard from 'clipboardy';
import yoctoSpinner from 'yocto-spinner';
import Blueprint from 'factorio-blueprint';
import { Jimp, intToRGBA } from 'jimp';
import { resolve } from 'node:path';

const toColor = (input) => input.join('-');
const toKey = ([r, g, b]) => `${r}-${g}-${b}`;

const Entity = {
    stone_path: 'stone_path',
    concrete: 'concrete',
    refined_concrete: 'refined_concrete',
    hazard_concrete_left: 'hazard_concrete_left',
    refined_hazard_concrete_left: 'refined_hazard_concrete_left',
};

const EntityColors = {
    [Entity.stone_path]: [80, 82, 72],
    [Entity.concrete]: [56, 56, 56],
    [Entity.refined_concrete]: [48, 48, 40],
    [Entity.hazard_concrete_left]: [176, 138, 32],
    [Entity.refined_hazard_concrete_left]: [112, 90, 24],
};

const ColorToEntity = {
    [toColor(EntityColors[Entity.stone_path])]: Entity.stone_path,
    [toColor(EntityColors[Entity.concrete])]: Entity.concrete,
    [toColor(EntityColors[Entity.refined_concrete])]: Entity.refined_concrete,
    [toColor(EntityColors[Entity.hazard_concrete_left])]: Entity.hazard_concrete_left,
    [toColor(EntityColors[Entity.refined_hazard_concrete_left])]: Entity.refined_hazard_concrete_left,
};

/**
 * color similarity between colors, lower is better
 * @param {array} rgbColor array of ints to make a rgb color: [int,int,int]
 * @param {array} compareColor array of ints to make a rgb color: [int,int,int]
 * @returns {number} limits [0-441.6729559300637]
 */
const colorSim = (rgbColor, compareColor) => {
    let i;
    let max;
    let d = 0;
    for (i = 0, max = rgbColor.length; i < max; i++) {
        d += (rgbColor[i] - compareColor[i]) * (rgbColor[i] - compareColor[i]);
    }
    return Math.sqrt(d);
};

const filled = (x, y, img) => {
    const pixel = img.getPixelColor(x, y);

    if (pixel) {
        const { r, g, b, a } = intToRGBA(pixel);

        if (r !== 0 && g !== 0 && b !== 0 && a === 255) {
            return true;
        }
    }

    return false;
};

const isInBounds = (x, y, bounds) => {
    if (
        x < bounds.minX 
        || x > bounds.maxX
        || y < bounds.minY
        || y > bounds.maxY
    ) {
        return false;
    }

    return true;
};

const isFilled = (x, y, img, thickness) => {
    const bounds = {
        minX: 0,
        maxX: img.bitmap.width,
        minY: 0,
        maxY: img.bitmap.height,
    };

    for (let posX = x - thickness; posX <= x + thickness; posX++) {
        for (let posY = y - thickness; posY <= y + thickness; posY++) {
            if (!isInBounds(posX, posY, bounds)) {
                return true;
            } else if (!filled(posX, posY, img)) {
                return true;
            }
        }
    }

    return false;
};

const main = async ({ file }) => {
    console.log(`\nhttps://tezumie.github.io/Image-to-Pixel/\n`);

    const filePath = resolve(file);
    const spinner = yoctoSpinner({ text: `Generating pattern` }).start();

    const bp = new Blueprint();
    const img = await Jimp.read(filePath);

    for (let x = 0; x <= img.bitmap.width; x++) {
        for (let y = 0; y <= img.bitmap.height; y++) {
            const pixel = img.getPixelColor(x, y);

            if (pixel) {
                const { r, g, b, a } = intToRGBA(pixel);

                if (r !== 0 && g !== 0 && b !== 0 && a === 255) {
                    const key = toKey([r, g, b]);
                    let entity = ColorToEntity[key];

                    if (!entity) {
                        let selectedColor = [];
                        let currentSim = colorSim([r, g, b], EntityColors[Entity.stone_path]);
                        let nextColor;

                        Object.keys(Entity).forEach((entity) => {
                            nextColor = colorSim([r, g, b], EntityColors[entity]);
                            if (nextColor <= currentSim) {
                                selectedColor = EntityColors[entity];
                                currentSim = nextColor;
                            }
                        });

                        entity = ColorToEntity[toKey(selectedColor)];
                    }

                    if (entity) {
                        bp.createTile(entity, { x, y }, Blueprint.UP);

                        if (isFilled(x, y, img, 3)) {
                            bp.createEntity('stone-wall', { x, y }, Blueprint.UP);
                        }
                    }
                }
            }
        }
    }

    await clipboard.write(bp.encode());

    spinner.success('Success! Blueprint copied to clipboard');
};

main({
    file: process.argv[2],
});
