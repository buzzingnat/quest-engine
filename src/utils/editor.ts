import _ from 'lodash';

import { LayerDefinition, Room } from 'types';

export function applyRoomToLayer(layer: LayerDefinition, room: Room): LayerDefinition {
    const grid = _.cloneDeep(layer.grid);
    const wallGrid = _.cloneDeep(layer.wallGrid);
    const L = room.x, R = room.x + room.w;
    const T = room.y, B = room.y + room.h;
    for (let y = T; y <= B; y++) {
        grid.tiles[y] = grid.tiles[y] || [];
        wallGrid.leftWalls[y] = wallGrid.leftWalls[y] || [];
        wallGrid.topWalls[y] = wallGrid.topWalls[y] || [];
        for (let x = L; x <= R; x++) {
            if (x < R && y < B) {
                grid.tiles[y][x] = {x: 0, y: 0};
            }
            if (y < B) {
                wallGrid.leftWalls[y][x] = (x === L || x === R);
            }
            if (x < R) {
                wallGrid.topWalls[y][x] = (y === T || y === B);
            }
        }
    }
    return {
        ...layer,
        grid,
        wallGrid,
    };
}
