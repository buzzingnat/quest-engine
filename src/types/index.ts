
export interface ShortRectangle {
    x: number,
    y: number,
    w: number,
    h: number,
    // This is a bit of a hack but it is a simple way of allowing me to
    // associate a depth value for an image.
    d?: number,
}
export interface FrameDimensions {
    w: number,
    h: number,
    // This is a bit of a hack but it is a simple way of allowing me to
    // associate a depth value for an image.
    d?: number,
    content?: ShortRectangle,
}
export interface FrameRectangle extends ShortRectangle {
    // When a frame does not perfectly fit the size of the content, this content rectangle can be
    // set to specify the portion of the image that is functionally part of the object in the frame.
    // For example, a character with a long time may have the content around the character's body and
    // exclude the tail when looking at the width/height of the character.
    content?: ShortRectangle,
}

export interface Frame extends FrameRectangle {
    image: HTMLCanvasElement | HTMLImageElement,
    // Additional property that may be used in some cases to indicate a frame should be flipped
    // horizontally about the center of its content. Only some contexts respect this.
    flipped?: boolean,
}

export interface ExtraAnimationProperties {
    // The animation will loop unless this is explicitly set to false.
    loop?: boolean,
    // Frame to start from after looping.
    loopFrame?: number,
}

export type FrameAnimation = {
    frames: Frame[],
    frameDuration: number,
    duration: number,
} & ExtraAnimationProperties;

export interface TilePalette {
    // The size of the tiles
    w: number,
    h: number,
    // The source frame of the tiles.
    source: Frame,
}

export interface Tile {
    // The column/row coordinates of the tile in the source frame.
    x: number,
    y: number,
}

export interface TileGrid {
    // The dimensions of the grid.
    w: number,
    h: number,
    // The palette to use for this grid (controls the size of tiles)
    palette: TilePalette,
    // The matrix of tiles
    tiles: Tile[][],
}

export interface WallGrid {
    topWallFrame: Frame,
    topWalls: boolean[][],
    leftWallFrame: Frame,
    leftWalls: boolean[][],
}

export interface LayerDefinition {
    // Unique identifier for this layer.
    key: string,
    grid?: TileGrid,
    wallGrid?: WallGrid,
    // Coordinates for the layer origin, if not (0, 0).
    x?: number,
    y?: number,
    selectedTile?: Tile,
}

export interface Room extends ShortRectangle {
    key: string,
}

export interface BaseAreaDefinition {
    w: number,
    h: number,
    layers: LayerDefinition[],
}

export interface QuestEngineAreaDefinition extends BaseAreaDefinition {
    rooms: Room[],
    roomGrid: string[][],
}

export type AreaDefinition = BaseAreaDefinition | QuestEngineAreaDefinition;

export interface PanelComponentProps {
    state: AppState,
    dispatch: React.Dispatch<any>,
}

export interface PanelProps {
    key: string,
    x: number,
    y: number,
    w: number,
    h: number,
    // getChildren: (state: AppState, dispatch: React.Dispatch<any>) => JSX.Element,
}

export interface AppState {
    panels: PanelProps[],
    // State for editing area
    area: AreaDefinition,
    selectedLayer: string,
    // State for dragging panels
    dragKey?: string,
    dragX?: number,
    dragY?: number,
    tools: Tool[],
    selectedTool: string,
}

export interface BaseTool {
    key: string,
    start?: (state: AppState, action) => AppState,
    move?: (state: AppState, action) => AppState,
    stop?: (state: AppState, action) => AppState,
}
export interface MoverTool extends BaseTool {
    // The position relative to the layer when the move action begins,
    // this is needed to calculate the new layer position as they drag the layer.
    dx: number,
    dy: number,
}
export interface RoomTool extends BaseTool {
    // The initial position the room is drawn from.
    sx: number,
    sy: number,
    // The current/ending position of the drawn room.
    ex: number,
    ey: number,
}
export type Tool = BaseTool | MoverTool | RoomTool;

