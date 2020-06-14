import { palettes, sideWallFrame, topWallFrame } from 'content/palettes';

import { AreaDefinition, QuestEngineAreaDefinition } from 'types';


const ADVENTURE_WIDTH = 320;
const ADVENTURE_HEIGHT = 180;

const ttWidth = 2 * ADVENTURE_WIDTH;

export const treasureTycoonTemplate: AreaDefinition = {
    w: ttWidth,
    h: ADVENTURE_HEIGHT,
    layers: [
        {
            key: 'floor',
            y: 84,
            grid: {
                palette: palettes.guildFloor,
                w: Math.ceil(ttWidth / palettes.guildFloor.w),
                h: 3,
                tiles: [],
            }
        },
        {
            key: 'wall',
            grid: {
                palette: palettes.guildWall,
                w: Math.ceil(ttWidth / palettes.guildWall.w),
                h: 1,
                tiles: [],
            }
        },
        {
            key: 'south',
            y: 116,
            grid: {
                palette: palettes.guildNorthSouth,
                w: Math.ceil(ttWidth / palettes.guildNorthSouth.w),
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
                w: 26,
                h: 19,
                tiles: [],
            },
            roomGrid: {
                tiles: [],
                topWalls: [],
                leftWalls: [],
            },
            wallGrid: {
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
