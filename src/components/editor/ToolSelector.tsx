import React from 'react';

import { Tool } from 'types';

interface ToolSelectorProps {
    dispatch: React.Dispatch<any>,
    selectedTool: string,
    tools: Tool[],
}

const ToolSelector = React.memo(({dispatch, selectedTool, tools}: ToolSelectorProps) => {

    return (
        <div>
            {tools.map(tool => (
                <div
                    key={tool.key}
                    onClick={event => {
                        dispatch({type: 'selectTool', key: tool.key});
                    }}
                    style={{
                        height: '40px',
                        backgroundColor: tool.key === selectedTool ? '#888' : '#444',
                        cursor: 'pointer',
                    }}
                >
                    {tool.key}
                </div>
            ))}
        </div>
    );
});

export default ToolSelector;
