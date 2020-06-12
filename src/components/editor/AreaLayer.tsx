import React from 'react';

import { drawFrame } from 'utils/animations';
import { applyRoomToLayer } from 'utils/editor';

import { Frame, LayerDefinition, Room, TileGrid, WallGrid } from 'types';

interface AreaLayerProps {
    dispatch: React.Dispatch<any>,
    drawingRoom: Room,
    isSelected: boolean,
    layerDefinition: LayerDefinition,
    scale: number,
}

const AreaLayer = React.memo(({dispatch, drawingRoom, isSelected, layerDefinition, scale}: AreaLayerProps) => {
    let definition = layerDefinition;
    if (isSelected && layerDefinition.grid && layerDefinition.wallGrid && drawingRoom) {
        definition = applyRoomToLayer(layerDefinition, drawingRoom);
    }
    const {grid, wallGrid} = definition;
    return (
        <div
            style={{
                position: 'absolute', left: `${layerDefinition.x}px`, top: `${layerDefinition.y}px`,
            }}
        >
            {grid && <GridCanvas grid={grid} isSelected={isSelected} />}
            {grid && wallGrid && <SortedCanvas grid={grid} wallGrid={wallGrid} isSelected={isSelected} />}
        </div>
    );
});

interface GridCanvasProps {
    grid: TileGrid,
    isSelected: boolean,
}
const GridCanvas = React.memo(({grid, isSelected}: GridCanvasProps) => {

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
                if (grid.tiles[y]?.[x]) {
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
    wallGrid: WallGrid,
    isSelected: boolean,
}
const SortedCanvas = React.memo(({grid, wallGrid, isSelected}: SortedCanvasProps) => {
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
                if (wallGrid.topWalls[y]?.[x]) {
                    drawFrame(context, wallGrid.topWallFrame, {
                        x: x * w, y: y * h,
                        w: wallGrid.topWallFrame.w,
                        h: wallGrid.topWallFrame.h,
                    });
                }
            }
            for (let x = 0; x <= grid.w; x++) {
                if (wallGrid.leftWalls[y]?.[x]) {
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
