export function selectAreadata2graphRenderData(selectAreaArray: any[]) {
    let nodes: {
            memoChildren?: any[];
            id: any;
            type: any;
            height: any;
            width: any;
            x: any;
            y: any;
            properties: { [key: string]: any };
            children?: any[];
            nodetype?: string;
        }[] = [],
        edges: { id: string; type: any; sourceNodeId: any; targetNodeId: any }[] = [];
    const offsetx = selectAreaArray.find((item) => item.BaseType === 'node').x - 100;
    const offsety = selectAreaArray.find((item) => item.BaseType === 'node').y - 100;
    selectAreaArray.forEach(
        (item: {
            [x: string]: any;
            children: any;
            BaseType: string;
            properties: { [x: string]: any };
            id: any;
            type: any;
            _height: any;
            _width: any;
            x: any;
            y: any;
            sourceNodeId: any;
            targetNodeId: any;
        }) => {
            if (item.BaseType === 'node') {
                if (item.children) {
                    nodes.push({
                        id: item.id,
                        type: item.type,
                        height: item._height,
                        width: item._width,
                        x: item.x - offsetx,
                        y: item.y - offsety,
                        properties: {...item.getProperties()},
                        children: [...item.children],
                    });
                } else {
                    nodes.push({
                        id: item.id,
                        type: item.type,
                        height: item._height,
                        width: item._width,
                        x: item.x - offsetx,
                        y: item.y - offsety,
                        properties: item.getProperties(),
                    });
                }
            }
            if (item.BaseType === 'edge') {
                edges.push({
                    id: item.id,
                    type: item.type,
                    sourceNodeId: item.sourceNodeId,
                    targetNodeId: item.targetNodeId,
                });
            }
        }
    );
    return {
        nodes,
        edges,
    };
}
