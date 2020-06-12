import caveFloorTiles from 'gfx/caveFloorTiles.png';
import guildFloorTiles from 'gfx/guildFloorTiles.png';
import allFloorTiles from 'gfx/floorTiles.png';
import meadowTiles from 'gfx/meadowTiles.png';
import northSouthTiles from 'gfx/northSouthTiles.png';
import guildWallTiles from 'gfx/wallTiles.png';

import sideWall from 'gfx/sideWall.png';
import topWall from 'gfx/topWall.png';

import { requireImage } from 'utils/animations';

import { TilePalette } from 'types';

const allFloor: TilePalette = {
    w: 32,
    h: 32,
    source: {image: requireImage(allFloorTiles), x: 0, y: 0, w: 5 * 32, h: 3*32},
};
const guildFloor: TilePalette = {
    w: 32,
    h: 32,
    source: {image: requireImage(guildFloorTiles), x: 0, y: 0, w: 32, h: 3 * 32},
};
const caveFloor: TilePalette = {
    w: 32,
    h: 32,
    source: {image: requireImage(caveFloorTiles), x: 0, y: 0, w: 6 * 32, h: 32},
};
const meadowFloor: TilePalette = {
    w: 32,
    h: 32,
    source: {image: requireImage(meadowTiles), x: 0, y: 0, w: 6 * 32, h: 32},
};
const guildWall: TilePalette = {
    w: 128,
    h: 86,
    source: {image: requireImage(guildWallTiles), x: 0, y: 0, w: 3 * 128, h: 86},
};
const guildNorthSouth: TilePalette = {
    w: 32,
    h: 64,
    source: {image: requireImage(northSouthTiles), x: 0, y: 0, w: 9 * 32, h: 64},
};

export const sideWallFrame = {image: requireImage(sideWall), x: 0, y: 0, w: 4, h: 52};
export const topWallFrame = {image: requireImage(topWall), x: 0, y: 0, w: 36, h: 20};

export const palettes = {
    allFloor,
    caveFloor,
    guildFloor,
    guildWall,
    guildNorthSouth,
    meadowFloor,
};

export function combinePalettes(palettes: TilePalette[]): TilePalette {
    const {w, h} = palettes[0];
    let totalTiles: number = palettes.reduce(
        (sum, palette) => sum + (palette.source.w / w) * (palette.source.h / h), 0);
    const canvas = document.createElement('canvas');
    canvas.width = 5 * w;
    canvas.height = Math.ceil(totalTiles / 5) * h;
    const context = canvas.getContext('2d');
    let x = 0, y = 0;
    for (const palette of palettes) {
        for (let py = 0; py < palette.source.h; py += h) {
            for (let px = 0; px < palette.source.w; px += w) {
                context.drawImage(palette.source.image,
                    px, py, w, h,
                    x, y, w, h)
                x += w;
                if (x >= 5 * w) {
                    x = 0;
                    y += h;
                }
            }
        }
    }

    return {
        w,
        h,
        source: {image: canvas, x: 0, y: 0, w: canvas.width, h: canvas.height},
    };
}
