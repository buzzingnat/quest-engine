import React from 'react';

import LayerProperties from 'components/editor/LayerProperties';

import { LayerDefinition } from 'types';

interface LayerListProps {
    layers: LayerDefinition[],
    selectedLayer: string,
    dispatch: React.Dispatch<any>,
}

const LayerList = React.memo(({dispatch, layers, selectedLayer}: LayerListProps) => {
    return (
        <div>
            {layers.map(
                (layer) => (
                    <React.Fragment key={layer.key}>
                        <div
                            key={layer.key}
                            style={{
                                cursor: 'pointer',
                                padding: '4px',
                                backgroundColor: layer.key === selectedLayer ? '#003' : 'transparent',
                            }}
                            onClick={e => dispatch({type: 'selectLayer', key: layer.key})}
                        >
                            {layer.key}
                        </div>
                        { layer.key === selectedLayer && (
                            <LayerProperties key="layerProperties" dispatch={dispatch} layer={layer}/>
                        )}
                    </React.Fragment>
                )
            )}
        </div>
    );
});

export default LayerList;
