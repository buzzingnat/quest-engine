import { palettes, sideWallFrame, topWallFrame } from 'content/palettes';

import { AreaDefinition, QuestEngineAreaDefinition } from 'types';


export const ADVENTURE_WIDTH = 320;
export const ADVENTURE_HEIGHT = 180;

export const treasureTycoonTemplate: AreaDefinition = {
    w: 2 * ADVENTURE_WIDTH,
    h: ADVENTURE_HEIGHT,
    layers: [
        {
            key: 'floor',
            y: 84,
            grid: {
                palette: palettes.guildFloor,
                w: 10,
                h: 3,
                tiles: [],
            }
        },
        {
            key: 'wall',
            grid: {
                palette: palettes.guildWall,
                w: 5,
                h: 1,
                tiles: [],
            }
        },
        {
            key: 'south',
            y: 100,
            grid: {
                palette: palettes.guildNorthSouth,
                w: 5,
                h: 1,
                tiles: [],
            }
        },
    ],
};

export const questEngineTemplate: QuestEngineAreaDefinition = {
    w: 30 * 32 + 4,
    h: 20 * 32 + 20,
    layers: [
        {
            key: 'floor',
            x: 2,
            y: 18,
            grid: {
                palette: palettes.allFloor,
                w: 30,
                h: 20,
                tiles: [],
            },
            wallGrid: {
                w: 30,
                h: 20,
                tileWidth: 32,
                tileHeight: 32,
                topWallFrame: topWallFrame,
                topWalls: [],
                leftWallFrame: sideWallFrame,
                leftWalls: [],
            },
        },
    ],
    rooms: [],
    roomGrid: [],
};
