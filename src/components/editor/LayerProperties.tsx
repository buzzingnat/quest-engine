import React from 'react';

import { LayerDefinition, TileGrid } from 'types';

interface LayerPropertiesProps {
    layer: LayerDefinition,
    dispatch: React.Dispatch<any>,
}

const LayerProperties = React.memo(({dispatch, layer}: LayerPropertiesProps) => {
    const [x, setX] = React.useState(layer.x || 0);
    const [y, setY] = React.useState(layer.y || 0);
    React.useEffect(() => {
        setX(layer.x || 0);
        setY(layer.y || 0);
    }, [layer.x, layer.y]);
    return (
        <div style={{padding: '2px 16px', backgroundColor: '#008'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
                X
                <input type="number" value={x} style={{width: '3em'}}
                    onChange={event => setX(parseInt(event.target.value))}
                    onBlur={event => dispatch({type: 'updateSelectedLayer', layer: {x}})}
                />
                Y
                <input type="number" value={y} style={{width: '3em'}}
                    onChange={event => setY(parseInt(event.target.value))}
                    onBlur={event => dispatch({type: 'updateSelectedLayer', layer: {y}})}
                />
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
                Grid
                <input
                    type="checkbox"
                    checked={!!layer.grid}
                    onChange={() => dispatch({type: 'toggleGrid'})}
                />
            </div>
            {layer.grid && <GridProperties dispatch={dispatch} grid={layer.grid} />}
        </div>
    );
});

interface GridPropertiesProps {
    grid: TileGrid,
    dispatch: React.Dispatch<any>,
}

const GridProperties = React.memo(({dispatch, grid}: GridPropertiesProps) => {
    const [w, setWidth] = React.useState(grid.w);
    const [h, setHeight] = React.useState(grid.h);
    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
                Width
                <input type="number" value={w} style={{width: '3em'}}
                    onChange={event => setWidth(parseInt(event.target.value))}
                    onBlur={event => dispatch({type: 'updateGrid', grid: {w}})}
                />
                Height
                <input type="number" value={h} style={{width: '3em'}}
                    onChange={event => setHeight(parseInt(event.target.value))}
                    onBlur={event => dispatch({type: 'updateGrid', grid: {h}})}
                />
            </div>
        </div>
    );
});

export default LayerProperties;
