import clipboard from 'clipboardy';
import yoctoSpinner from 'yocto-spinner';
import Blueprint from 'factorio-blueprint';
import { Circle, CircleModes } from './generator.mjs';

const main = async ({ width, height, mode, thickness, force, entity }) => {

    const circle = new Circle({ width, height, mode, thickness, force });
    const { minX, maxX, minY, maxY } = circle.getBounds();

    const spinner = yoctoSpinner({text: `Generating ${circle.getDescription()}`}).start();

    const bp = new Blueprint();

    for (let x = minX; x < maxX; x++) {
        for (let y = minY; y < maxY; y++) {
            if (circle.isFilled(x, y)) {
                bp.createEntity(entity, { x, y }, Blueprint.UP);
            }
        }
    }

    await clipboard.write(bp.encode());

    spinner.success('Success! Blueprint copied to clipboard');
};

main({
    width: 50,
    height: 50,
    mode: CircleModes.thick,
    thickness: 10,
    force: true,
    entity: 'stone-wall',
});
