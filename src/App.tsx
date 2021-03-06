import _ from 'lodash';
import React from 'react';

import 'App.css';
import Area from 'components/editor/Area';
import LayerList from 'components/editor/LayerList';
import TileSelector from 'components/editor/TileSelector';
import ToolSelector from 'components/editor/ToolSelector';
import Panel from 'components/Panel';
import { treasureTycoonTemplate, questEngineTemplate } from 'content/areaTemplates';
import { combinePalettes, leftDoorFrame, palettes, topDoorFrame } from 'content/palettes';
import { waitForAllImagesToLoad } from 'utils/animations';
import { applyRoomToLayer, isQuestEngineArea } from 'utils/editor';

import {
    AppState, AreaDefinition, LayerDefinition,
    QuestEngineAreaDefinition,
    Room, RoomTool, SelectionTool, Tile, TileGrid
} from 'types';

export const SCALE = 1;

function getRoomTool(state: AppState): RoomTool {
    return _.find(state.tools, {key: 'roomTool'}) as RoomTool;
}

function getSelectionTool(state: AppState): SelectionTool {
    return _.find(state.tools, {key: 'selectionTool'}) as SelectionTool;
}


const initialState: AppState = {
    area: questEngineTemplate,
    selectedLayer: 'floor',
    panels: [
        {
            key: 'area',
            x: 0, y: 0,
            w: 1000, h: window.innerHeight,
        },
        {
            key: 'layers',
            x: 1000, y: 0,
            w: 300, h: 200,
        },
        {
            key: 'palette',
            x: 1000, y: 200, w: 300, h: 200,
        },
        {
            key: 'tools',
            x: 1000, y: 400, w: 300, h: 300,
        },
    ],
    tools: [
        {
            key: 'mover',
            dx: null,
            dy: null,
            start(state: AppState, action): AppState {
                const layer = _.find(state.area.layers, {key: state.selectedLayer});
                return updateTool(state, this.key, {dx: action.x / SCALE - (layer.x || 0), dy: action.y / SCALE - (layer.y || 0)});
            },
            move(state: AppState, action): AppState {

                return updateLayer(state, state.selectedLayer, {
                    x: Math.floor(action.x / SCALE - this.dx),
                    y: Math.floor(action.y / SCALE - this.dy),
                });
            },
        },
        {
            key: 'tileBrush',
            start(state: AppState, action): AppState {
                return paintGridTile(state, action);
            },
            move(state: AppState, action): AppState {
                return paintGridTile(state, action);
            }
        },
        {
            key: 'selectionTool',
            selection: null,
            dx: null,
            dy: null,
            start(state: AppState, action): AppState {
                const {x, y} = areaCoordsToSelectedLayerCoords(state, action);
                if (isQuestEngineArea(state.area)){
                    //find selected room
                    for (const room of state.area.rooms.slice().reverse()) {
                        if (x >= room.x && x < (room.x + room.w))
                            if(y >= room.y && y < (room.y + room.h)){
                                const layer = getSelectedLayer(state);
                                return updateTool(state, this.key, {
                                    selection: {type: 'room', key: room.key},
                                    dx: action.x / SCALE - room.x * layer.grid.palette.w,// - layer.x,
                                    dy: action.y / SCALE - room.y * layer.grid.palette.h,// - layer.y,
                                });
                            }
                    }
                }
                return updateTool(state, this.key, {selection: null});
            },
            move(state: AppState, action): AppState {
                const layer = getSelectedLayer(state);
                const tx = Math.floor((action.x / SCALE - this.dx) / layer.grid.palette.w);
                const ty = Math.floor((action.y / SCALE - this.dy) / layer.grid.palette.h);
                const rooms = (state.area as QuestEngineAreaDefinition).rooms.map(room => room.key !== this.selection.key ? room : {
                    ...room,
                    x: Math.max(0, Math.min(layer.grid.w - room.w, tx)),
                    y: Math.max(0, Math.min(layer.grid.h - room.h, ty)),
                });
                return refreshRoomGrid({
                    ...state,
                    area: {
                        ...state.area,
                        rooms,
                    },
                });
            },
        },

    ],
    selectedTool: 'mover',
}

if (isQuestEngineArea(initialState.area)) {
    initialState.tools.push({
        key: 'wallBrush',
        start(state: AppState, action): AppState {
            return paintWall(state, action);
        },
        move(state: AppState, action): AppState {
            return paintWall(state, action);
        }
    });
    initialState.tools.push({
        key: 'roomTool',
        sx: null,
        sy: null,
        ex: null,
        ey: null,
        start(state: AppState, action): AppState {
            const {x, y} = areaCoordsToSelectedLayerCoords(state, action);
            return updateTool(state, this.key, {sx: x, sy: y, ex: x, ey: y});
        },
        move(state: AppState, action): AppState {
            const {x, y} = areaCoordsToSelectedLayerCoords(state, action);
            return updateTool(state, this.key, {ex: x, ey: y});
        },
        stop(state: AppState, action): AppState {
            let area = state.area as QuestEngineAreaDefinition;
            const room = makeRoom(`room${nextRoomId++}`, getRoomTool(state));
            let newState = state;
            if (room) {
                const newLayer = applyRoomToLayer(getSelectedLayer(state), room);
                newState = updateLayer(state, state.selectedLayer, newLayer);
            }
            area = newState.area as QuestEngineAreaDefinition;
            newState = {
                ...newState,
                area: {
                    ...area,
                    rooms: [...area.rooms, room],
                },
            };
            return updateTool(newState, this.key, {sx: null, sy: null, ex: null, ey: null});
        },
    });
     initialState.tools.push({
        key: 'doorBrush',
        start(state: AppState, action): AppState {
            return paintDoor(state, action);
        },
    });
}

function makeRoom(key: string, {sx, sy, ex, ey}): Room {
    if (sx === null) {
        return null;
    }
    const x = Math.min(sx, ex);
    const w = Math.abs(sx - ex) + 1;
    const y = Math.min(sy, ey);
    const h = Math.abs(sy - ey) + 1;
    return {key, doors: [], x, y, w, h};
}

function updateTool(state: AppState, key: string, newProps): AppState {
    if (_.find([_.find(state.tools, {key})], newProps)) {
        return state;
    }
    return {
        ...state,
        tools: state.tools.map(tool => tool.key === key ? {...tool, ...newProps} : tool),
    };
}

function areaCoordsToSelectedLayerCoords(state: AppState, {x, y}): {x: number, y: number} {
    const layer = getSelectedLayer(state);
    if (!layer.grid) {
        console.error('Selected layer has no grid');
        return {x, y};
    }
    const palette = layer.grid.palette;
    return {
        x: Math.floor((x - SCALE * (layer.x || 0)) / (SCALE * palette.w)),
        y: Math.floor((y - SCALE * (layer.y || 0)) / (SCALE * palette.h))
    };
}

function paintGridTile(state: AppState, action) {
    const layer = getSelectedLayer(state);
    if (!layer.grid) {
        return state;
    }
    const tile: Tile = action.mouseButtonDown === 0 ? layer.selectedTile : null;
    const palette = layer.grid.palette;
    const x = Math.floor((action.x - SCALE * (layer.x || 0)) / (SCALE * palette.w));
    const y = Math.floor((action.y - SCALE * (layer.y || 0)) / (SCALE * palette.h));
    const tiles = [...layer.grid.tiles];
    // Do nothing if the tile already matches the selected tile.
    if (tiles[y]?.[x] === tile ||
        (tile?.x === tiles[y]?.[x]?.x && tile?.y === tiles[y]?.[x]?.y)
    ) {
        return state;
    }
    tiles[y] = [...(tiles[y] || [])];
    tiles[y][x] = tile;
    return updateLayer(state, state.selectedLayer, {
        grid: {
            ...layer.grid,
            tiles,
        },
    });
}

function paintWall(state: AppState, action) {
    const layer = getSelectedLayer(state);
    if (!layer.grid || !layer.wallGrid) {
        return state;
    }
    const value = action.mouseButtonDown === 0;
    let x = (action.x - SCALE * (layer.x || 0)) / SCALE;
    let y = (action.y - SCALE * (layer.y || 0)) / SCALE;
    const thickness = 16;
    x += thickness / 2;
    y += thickness / 2;
    const overTop = (y % layer.grid.palette.h < thickness);
    const overSide = (x % layer.grid.palette.w < thickness);
    x = Math.floor(x / layer.grid.palette.w);
    y = Math.floor(y / layer.grid.palette.h);
    if (overTop && !overSide) {
        const topWalls = [...layer.wallGrid.topWalls];
        topWalls[y] = [...(topWalls[y] || [])];
        if (topWalls[y][x] === value) {
            return state;
        }
        topWalls[y][x] = value;
        return updateLayer(state, state.selectedLayer, {
            wallGrid: {
                ...layer.wallGrid,
                topWalls,
            },
        });
    } else if (overSide && !overTop) {
        const leftWalls = [...layer.wallGrid.leftWalls];
        leftWalls[y] = [...(leftWalls[y] || [])];
        if (leftWalls[y][x] === value) {
            return state;
        }
        leftWalls[y][x] = value;
        return updateLayer(state, state.selectedLayer, {
            wallGrid: {
                ...layer.wallGrid,
                leftWalls,
            },
        });
    }
    return state;
}

function paintDoor(state: AppState, action) {
    const layer = getSelectedLayer(state);
    if (!layer.grid || !layer.doorGrid) {
        return state;
    }
    // Find the room under the cursor, if none, return state with no change.
    // Check if the cursor is over the grid edge, if not return state with no change. (already done)
    // Check if the wall is part of the room's outer wall, if not return state no change.state
    // Create a door object (isTop set based on edge type, x/y relative to room x/y) and update the room with the new door
    // Add a new updateRoom(state: AppState, roomKey: string, newProps: Partial<Room>): AppState function
    const value = action.mouseButtonDown === 0;
    let x = (action.x - SCALE * (layer.x || 0)) / SCALE;
    let y = (action.y - SCALE * (layer.y || 0)) / SCALE;
    const thickness = 16;
    x += thickness / 2;
    y += thickness / 2;
    const overTop = (y % layer.grid.palette.h < thickness);
    const overSide = (x % layer.grid.palette.w < thickness);
    x = Math.floor(x / layer.grid.palette.w);
    y = Math.floor(y / layer.grid.palette.h);
    if (overTop && !overSide) {
        //draw topDoors
        const topDoors = [...layer.doorGrid.topDoors];
        topDoors[y] = [...(topDoors[y] || [])];
        if (topDoors[y][x] === value) {
            return state;
        }
        topDoors[y][x] = value;
        return updateLayer(state, state.selectedLayer, {
            doorGrid: {
                ...layer.doorGrid,
                topDoors,
            },
        });
    } else if (overSide && !overTop) {
        //draw leftDoors
        const leftDoors = [...layer.doorGrid.leftDoors];
        leftDoors[y] = [...(leftDoors[y] || [])];
        if (leftDoors[y][x] === value) {
            return state;
        }
        leftDoors[y][x] = value;
        return updateLayer(state, state.selectedLayer, {
            doorGrid: {
                ...layer.doorGrid,
                leftDoors,
            },
        });
    }
    return state;
}

function selectedTool(state: AppState) {
    return _.find(state.tools, {key: state.selectedTool});
}

const KEY = {
    BACKSPACE: 8,
    DELETE: 46,
}

function refreshRoomGrid(state) {
    let layer: LayerDefinition = {
        ...getSelectedLayer(state),
        roomGrid: {
            tiles: [],
            leftWalls: [],
            topWalls: [],
        },
        doorGrid:  {
            leftDoorFrame,
            leftDoors: [],
            topDoorFrame,
            topDoors: [],
        }
    };
    for (const room of (state.area as QuestEngineAreaDefinition).rooms)
        layer = applyRoomToLayer(layer, room);
    return updateLayer(state, state.selectedLayer, layer);
}

let nextRoomId = 0;

function reducer(state: AppState, action): AppState {

    //console.log(action);
    switch (action.type) {
        case 'startDrag':
            return {
                ...state,
                dragKey: action.key, dragX: action.xOffset, dragY: action.yOffset
            };
        case 'mouseUp':
            if (!state.dragKey) {
                return state;
            }
            return {
                ...state,
                dragKey: null, dragX: null, dragY: null,
            };
        case 'keyDown': {
            const selection = getSelectionTool(state).selection;
            //console.log(action.which);
            if (action.which === KEY.BACKSPACE || action.which === KEY.DELETE )
                if (selection?.type === 'room' && isQuestEngineArea(state.area)) {
                    const rooms = state.area.rooms.filter(room => room.key !== selection.key);
                    return refreshRoomGrid({
                        ...state,
                        area: {
                            ...state.area,
                            rooms,
                        },
                    });
                }
            return state;
        }
        case 'toolStart': {
            const tool = selectedTool(state);
            if (!tool.start) {
                return state;
            }
            return tool.start(state, action)
        }
        case 'toolMove': {
            const tool = selectedTool(state);
            if (!tool.move) {
                return state;
            }
            return tool.move(state, action)
        }
        case 'toolStop': {
            const tool = selectedTool(state);
            if (!tool.stop) {
                return state;
            }
            return tool.stop(state, action)
        }
        case 'mouseMove': {
            const key = state.dragKey;
            if (key) {
                const panel = _.find(state.panels, {key});
                // Dragging moves a panel to the top of the stack, so we just remove it from
                // the array and stick it on the end.
                return {
                    ...state,
                    panels: [
                        ...state.panels.filter(p => p.key !== key),
                        {...panel, x: action.x + state.dragX, y: action.y + state.dragY},
                    ],
                };
            }
            return state;
        }
        case 'selectLayer':
            return {
                ...state,
                selectedLayer: action.key,
            }
        case 'toggleGrid': {
            const layer = _.find(state.area.layers, {key: state.selectedLayer});
            const grid: TileGrid = layer.grid ? null : getDefaultGrid();
            return updateLayer(state, state.selectedLayer, {grid});
        }
        case 'updateGrid': {
            const layer = _.find(state.area.layers, {key: state.selectedLayer});
            const grid: TileGrid = {
                ...layer.grid,
                ...action.grid,
            };
            return updateLayer(state, state.selectedLayer, {grid});
        }
        case 'updateSelectedLayer': {
            return updateLayer(state, state.selectedLayer, action.layer);
        }
        case 'selectTile': {
            return updateLayer({
                ...state,
                selectedTool: 'tileBrush',
            }, state.selectedLayer, {selectedTile: {x: action.x, y: action.y}});
        }
        case 'selectTool': {
            return {
                ...state,
                selectedTool: action.key,
            }
        }
        default:
            console.error('unhandled action', action);
            return state;
    }
}

function getDefaultGrid(): TileGrid {
    return {
        w: 20, h: 20, tiles: [], palette: palettes.allFloor,
    };
}

function getSelectedLayer(state: AppState): LayerDefinition {
    return _.find(state.area.layers, {key: state.selectedLayer});
}
function hasUpdatedProps(original: object, props: object): boolean {
    for (let key in props) {
        if (props[key] !== original[key]) {
            return true
        }
    }
    return false;
}
function updateLayer(state: AppState, key: string, updatedProps: Partial<LayerDefinition>): AppState {
    const layer = _.find(state.area.layers, {key});
    // If updated props match the current layer, it will be found and we can skip updating state.
    if (!hasUpdatedProps(layer, updatedProps))
        return state;
    return {
        ...state,
        area: {
            ...state.area,
            layers: state.area.layers.map(layer => layer.key !== key ? layer : {...layer, ...updatedProps}),
        },
    };
}

const App = React.memo((): JSX.Element => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    window['state'] = state;
    const { panels } = state;
    React.useEffect(() => {
        function onMouseMove(event: MouseEvent) {
            dispatch({type: 'mouseMove',
                x: event.pageX,
                y: event.pageY,
            });
        }
        function onMouseUp(event) {
            dispatch({type: 'mouseUp'});
        }
        function onKeyDown(event: KeyboardEvent) {
            dispatch({type: 'keyDown',
                which: event.which,
            });
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const roomTool = getRoomTool(state);
    const selectionTool = getSelectionTool(state);
    const layer = _.find(state.area.layers, {key: state.selectedLayer});
    const contentMap = {
        area: React.useMemo(() => (<Area
            areaDefinition={state.area}
            selection={selectionTool.selection}
            drawingRoom={roomTool && makeRoom('newRoom', roomTool)}
            selectedLayer={state.selectedLayer}
            dispatch={dispatch}
            scale={SCALE}
        />), [state.area, state.selectedLayer, roomTool, selectionTool]),
        layers: React.useMemo(() => (<LayerList
            dispatch={dispatch}
            layers={state.area.layers}
            selectedLayer={state.selectedLayer}
        />), [state.area.layers, state.selectedLayer]),
        palette: React.useMemo(() => (layer.grid && <TileSelector
            dispatch={dispatch} palette={layer.grid.palette}
        />), [layer.grid]),
        tools: React.useMemo(() => (<ToolSelector
            dispatch={dispatch}
            tools={state.tools}
            selectedTool={state.selectedTool}
        />), [state.tools, state.selectedTool]),
    };

    return (
        <div className="App">
            <header className="App-header">
                { panels.map(({key, x, y, w, h}) => {
                    return (
                        <Panel key={key}
                            panelKey={key}
                            x={x}
                            y={y}
                            w={w}
                            h={h}
                            dispatch={dispatch}
                        >
                            { contentMap[key] }
                        </Panel>
                    );
                })}
            </header>
        </div>
    );
});

export default App;
