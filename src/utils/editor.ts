import _ from 'lodash';

import { AreaDefinition, LayerDefinition, QuestEngineAreaDefinition, Room, } from 'types';

export function applyRoomToLayer(layer: LayerDefinition, room: Room): LayerDefinition {
    const tiles = _.cloneDeep(layer.roomGrid.tiles);
    const leftWalls = _.cloneDeep(layer.roomGrid.leftWalls);
    const topWalls = _.cloneDeep(layer.roomGrid.topWalls);
    const L = room.x, R = room.x + room.w;
    const T = room.y, B = room.y + room.h;
    for (let y = T; y <= B; y++) {
        tiles[y] = tiles[y] || [];
        leftWalls[y] = leftWalls[y] || [];
        topWalls[y] = topWalls[y] || [];
        for (let x = L; x <= R; x++) {
            if (x < R && y < B) {
                tiles[y][x] = {x: 0, y: 0};
            }
            if (y < B) {
                leftWalls[y][x] = (x === L || x === R);
            }
            if (x < R) {
                topWalls[y][x] = (y === T || y === B);
            }
        }
    }
    return {
        ...layer,
        roomGrid: {
            ...layer.roomGrid,
            tiles,
            leftWalls,
            topWalls,
        },
    };
}

export function isQuestEngineArea(area: AreaDefinition): area is QuestEngineAreaDefinition {
    return !!(area as QuestEngineAreaDefinition).rooms;
}
