import React, {useEffect} from 'react';

import { drawFrame } from 'utils/animations';

import { TilePalette } from 'types';

interface TileSelectorProps {
    dispatch: React.Dispatch<any>,
    palette: TilePalette,
}

const TileSelector = React.memo(({dispatch, palette}: TileSelectorProps) => {
    const [selecting, setSelecting] = React.useState(false);

    const selectTile = React.useCallback((event: MouseEvent) => {
        const bounds = (event.target as HTMLElement).getBoundingClientRect();
        const x = Math.floor((event.clientX - bounds.left) / palette.w);
        const y = Math.floor((event.clientY - bounds.top) / palette.h);
        dispatch({type: 'selectTile',
            x,
            y,
        });
    }, [dispatch, palette]);

    React.useEffect(() => {
        if (!selecting) {
            return;
        }
        function onMouseUp(event) {
            setSelecting(false);
        }
        document.addEventListener("mousemove", selectTile);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", selectTile);
            document.addEventListener("mouseup", onMouseUp);
        };
    }, [selecting, selectTile]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) {
            return;
        }
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawFrame(context, palette.source, palette.source);
    });

    const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={event => {
                    setSelecting(true);
                    selectTile(event.nativeEvent);
                }}
                width={palette.source.w}
                height={palette.source.h}
            />
        </div>
    );
});

export default TileSelector;
