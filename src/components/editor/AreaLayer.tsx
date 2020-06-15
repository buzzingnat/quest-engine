import React from 'react';

import { drawFrame } from 'utils/animations';
import { applyRoomToLayer } from 'utils/editor';

import { DoorGrid, Frame, LayerDefinition, Room, RoomGrid, TileGrid, WallGrid } from 'types';

interface AreaLayerProps {
    dispatch: React.Dispatch<any>,
    drawingRoom: Room,
    isSelected: boolean,
    layerDefinition: LayerDefinition,
    scale: number,
    selectedRoom: Room,
}

const AreaLayer = React.memo(({dispatch, drawingRoom, isSelected, layerDefinition, scale, selectedRoom}: AreaLayerProps) => {
    let definition = layerDefinition;
    if (isSelected && layerDefinition.grid && layerDefinition.wallGrid && drawingRoom) {
        definition = applyRoomToLayer(layerDefinition, drawingRoom);
    }
    const {grid, wallGrid, doorGrid} = definition;
    const palette = grid?.palette;
    return (
        <div
            style={{
                position: 'absolute', left: `${layerDefinition.x}px`, top: `${layerDefinition.y}px`,
            }}
        >
            {grid && <GridCanvas grid={grid} roomGrid={definition.roomGrid} isSelected={isSelected} />}
            {grid && wallGrid && <SortedCanvas
                grid={grid}
                roomGrid={definition.roomGrid}
                wallGrid={wallGrid}
                doorGrid={doorGrid}
                isSelected={isSelected}
            />}
            {palette && selectedRoom && <div style={{
                position: 'absolute',
                backgroundColor: 'rgba(255,255,255,0.5)',
                left: `${selectedRoom.x * palette.w}px`, top: `${selectedRoom.y * palette.h}px`,
                width: `${selectedRoom.w * palette.w}px`, height: `${selectedRoom.h * palette.h}px`,
            }}>
            </div>}
        </div>
    );
});

interface GridCanvasProps {
    grid: TileGrid,
    roomGrid?: RoomGrid,
    isSelected: boolean,
}
const GridCanvas = React.memo(({grid, roomGrid, isSelected}: GridCanvasProps) => {

    const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
    const width = grid.palette.w * grid.w;
    const height = grid.palette.h * grid.h;

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) {
            return;
        }
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const {w, h} = grid.palette;
        const baseTile = {
            image: grid.palette.source.image,
            w, h,
        };
        for (let y = 0; y < grid.h; y++) {
            for (let x = 0; x < grid.w; x++) {
                if (roomGrid?.tiles?.[y]?.[x]) {
                    const frame: Frame = {
                        ...baseTile,
                        x: roomGrid.tiles[y][x].x * grid.palette.w,
                        y: roomGrid.tiles[y][x].y * grid.palette.h,
                    };
                    drawFrame(context, frame, {x: x * w, y: y * h, w, h});
                } else if (grid.tiles[y]?.[x]) {
                    const frame: Frame = {
                        ...baseTile,
                        x: grid.tiles[y][x].x * grid.palette.w,
                        y: grid.tiles[y][x].y * grid.palette.h,
                    };
                    drawFrame(context, frame, {x: x * w, y: y * h, w, h});
                } else {
                    context.save();
                        context.fillStyle = 'white';
                        context.globalAlpha = isSelected ? 0.5 : 0.2;
                        context.fillRect(x * w, y * h, w, 1);
                        context.fillRect(x * w, y * h, 1, h);
                        context.fillRect(x * w, y * h + h -1, w, 1);
                        context.fillRect(x * w + w -1, y * h, 1, h);
                    context.restore();
                }
            }
        }
    });

    return (
        <canvas style={{position: 'absolute', left: '0', top: '0'}} ref={canvasRef} width={width} height={height} />
    );
});

interface SortedCanvasProps {
    grid: TileGrid,
    roomGrid?: RoomGrid,
    wallGrid: WallGrid,
    doorGrid: DoorGrid,
    isSelected: boolean,
}
const SortedCanvas = React.memo(({doorGrid, grid, roomGrid, wallGrid, isSelected}: SortedCanvasProps) => {
    const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
    const width = grid.w * grid.palette.w + 4;
    const height = grid.h * grid.palette.h + 20;

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) {
            return;
        }
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const w = grid.palette.w;
        const h = grid.palette.h;
        for (let y = 0; y <= grid.h; y++) {
            for (let x = 0; x <= grid.w; x++) {
                if (doorGrid?.topDoors[y]?.[x] === true) {
                    context.save();
                    context.globalAlpha = 0;
                    drawFrame(context, doorGrid.topDoorFrame, {
                        x: x * w, y: y * h,
                        w: doorGrid.topDoorFrame.w,
                        h: doorGrid.topDoorFrame.h,
                    });
                    context.restore();
                } else if (roomGrid?.topWalls[y]?.[x] === true) {
                    drawFrame(context, wallGrid.topWallFrame, {
                        x: x * w, y: y * h,
                        w: wallGrid.topWallFrame.w,
                        h: wallGrid.topWallFrame.h,
                    });
                } else if (roomGrid?.topWalls[y]?.[x] !== false && wallGrid.topWalls[y]?.[x]) {
                    drawFrame(context, wallGrid.topWallFrame, {
                        x: x * w, y: y * h,
                        w: wallGrid.topWallFrame.w,
                        h: wallGrid.topWallFrame.h,
                    });
                }
            }
            for (let x = 0; x <= grid.w; x++) {
                if (doorGrid?.leftDoors[y]?.[x] === true) {
                    context.save();
                    context.globalAlpha = 0;
                    drawFrame(context, doorGrid.leftDoorFrame, {
                        x: x * w, y: y * h,
                        w: doorGrid.leftDoorFrame.w,
                        h: doorGrid.leftDoorFrame.h,
                    });
                    context.restore();
                } else if (roomGrid?.leftWalls[y]?.[x] === true) {
                    drawFrame(context, wallGrid.leftWallFrame, {
                        x: x * w, y: y * h,
                        w: wallGrid.leftWallFrame.w,
                        h: wallGrid.leftWallFrame.h,
                    });
                } else if (roomGrid?.leftWalls[y]?.[x] !== false && wallGrid.leftWalls[y]?.[x]) {
                    drawFrame(context, wallGrid.leftWallFrame, {
                        x: x * w, y: y * h,
                        w: wallGrid.leftWallFrame.w,
                        h: wallGrid.leftWallFrame.h,
                    });
                }
            }
        }
    });

    return (
        <canvas style={{position: 'absolute', left: '-2px', top: '-18px'}}  ref={canvasRef} width={width} height={height} />
    );
});

export default AreaLayer;
