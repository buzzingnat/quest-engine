import React from 'react';

interface PanelProps {
    children: React.ReactNode,
    dispatch: React.Dispatch<any>,
    panelKey: string,
    x: number,
    y: number,
    w: number,
    h: number,
}

const Panel = React.memo(({
  children,
  dispatch,
  panelKey,
  x, y,
  w, h,
}: PanelProps) => {
    // console.log('Render panel', panelKey);
    const [isResizing, setIsResizing] = React.useState(false);
    const [width, setWidth] = React.useState(w);
    const [height, setHeight] = React.useState(h);
    const containerRef = React.useRef();

    React.useEffect(() => {
        const container: HTMLElement = containerRef.current;
        if (!isResizing || !container) {
            return;
        }
        const bounds = container.getBoundingClientRect();
        function onMouseMove(event) {
            const x = Math.max(0, Math.min(event.pageX, window.innerWidth)) - bounds.left;
            setWidth(Math.max(20, x));
            let y = Math.max(0, Math.min(event.pageY, window.innerHeight)) - bounds.top;
            setHeight(Math.max(20, y));
        }
        function onMouseUp(event) {
            setIsResizing(false);
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };
    }, [containerRef, isResizing, width, height]);

    const barHeight = 10;
    const boundX = Math.max(0, Math.min(x, window.innerWidth - width));
    const boundY = Math.max(0, Math.min(y, window.innerHeight - height));
    return (
    <div
        className="panel"
        ref={containerRef}
        style={
            {
                position: 'absolute', width: `${width}px`, height: `${height}px`,
                left: `${boundX}px`, top: `${boundY}px`,
                //backgroundColor: 'white',
                // h v blur spread color
                boxShadow: '2px 2px 5px 2px rgba(0,0,0,0.3)',
                overflow: 'hidden',
            }
    }>
        <div
            style={
                {height: `${barHeight}px`, backgroundColor: '#CCC'}
            }
            onMouseDown={(event) => {
                event.preventDefault();
                const xOffset = x - event.pageX;
                const yOffset = y - event.pageY;
                dispatch({type: 'startDrag', key: panelKey, xOffset, yOffset});
            }}
        >
        </div>
        <div
            style={
                {
                    width: `${width}px`,
                    height: `${height - barHeight}px`,
                    overflow: 'auto',
                }
            }
        >
            { children }
        </div>
        <div
            style={
                {
                    position: 'absolute', right: '0', bottom: '0',
                    height: `${barHeight}px`, width: `${barHeight}px`, backgroundColor: '#CCC'
                }
            }
            onMouseDown={(event) => {
                event.preventDefault();
                setIsResizing(true);
            }}
        >
        </div>
    </div>
    );
});

export default Panel;
