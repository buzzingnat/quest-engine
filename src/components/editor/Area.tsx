import React from 'react';

import AreaLayer from 'components/editor/AreaLayer';

import { AreaDefinition, Room } from 'types';

interface AreaProps {
    areaDefinition: AreaDefinition,
    dispatch: React.Dispatch<any>,
    drawingRoom: Room,
    scale: number,
    selectedLayer: string,
}

const Area = React.memo(({areaDefinition, dispatch, drawingRoom, scale, selectedLayer}: AreaProps) => {
    const { layers } = areaDefinition;

    const [mouseButtonDown, setMouseButtonDown] = React.useState(-1);

    const sendEvent = React.useCallback((event: MouseEvent, eventType: string, mouseButtonDown: number) => {
        const areaDiv = (event.target as HTMLElement).closest('.area');
        if (!areaDiv) {
            return;
        }
        const bounds = areaDiv.getBoundingClientRect();
        // ScreenX/Y relative to whole screen (outside of browser)
        // offsetY is relative to target (too narrow)
        //console.log('y', event.pageY, event.clientY, event.offsetY, event.screenY, event.movementY);
        const x = (event.pageX + areaDiv.scrollLeft - bounds.left);
        const y = (event.pageY + areaDiv.scrollTop - bounds.top);
        dispatch({type: eventType,
            mouseButtonDown,
            x,
            y,
        });
    }, [dispatch]);

    React.useEffect(() => {
        if (mouseButtonDown < 0) {
            return;
        }
        function onMouseMove(event) {
            sendEvent(event, 'toolMove', mouseButtonDown);
        }
        function onMouseUp(event) {
            sendEvent(event, 'toolStop', mouseButtonDown);
            setMouseButtonDown(-1);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };
    }, [sendEvent, areaDefinition, mouseButtonDown]);

    return (
        <div
            className="area"
            style={{
                position: 'relative',
                width: `${areaDefinition.w}px`,
                height: `${areaDefinition.h}px`,
                backgroundColor: 'black',
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
            }}
            onContextMenu={event => {
                event.preventDefault();
                return false;
            }}
            onMouseDown={event => {
                // Only process the first mouse button pressed.
                if (mouseButtonDown >= 0) {
                    return;
                }
                setMouseButtonDown(event.button);
                sendEvent(event.nativeEvent, 'toolStart', event.button);
            }}
        >
            {layers.map(
                layer => (
                    <AreaLayer
                        key={layer.key}
                        dispatch={dispatch}
                        drawingRoom={drawingRoom}
                        isSelected={layer.key === selectedLayer}
                        layerDefinition={layer}
                        scale={scale}
                    />
                )
            )}
        </div>
    );
});

export default Area;
