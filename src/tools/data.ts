function graphdataobj2templatestructurefromStart(data, res) {
    // 找到流程开始节点，start
    const { nodes, edges } = data;
    let startNode = nodes.find((item: { type: string }) => item.type === 'start');
    // 找其包含sourceNodeId节点的所有边
    let allfindEdgeIds = edges.filter((item: { sourceNodeId: any }) => item.sourceNodeId === startNode.id).map((item) => item.targetNodeId);
    let targetNodes = nodes.filter((item) => allfindEdgeIds.indexOf(item.id) != -1);
    // 完善这些节点的输入组件
    targetNodes.forEach((item) => {
        let tempproperties = item.properties;
        let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
        res[nodeid] = {
            ...tempproperties,
            inputTask: undefined,
        };
        makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
    });
}
function makeTaskInputTaskConnection({ currentNode, currentNodeId, data, res }) {
    const { nodes, edges } = data;
    let allfindEdgeIds = edges.filter((item) => item.sourceNodeId === currentNode.id).map((item) => item.targetNodeId);
    let targetNodes = nodes.filter((item) => allfindEdgeIds.indexOf(item.id) != -1);
    targetNodes.forEach((item) => {
        if (item.type !== 'end') {
            let tempproperties = item.properties;
            let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
            if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    inputArgs: res[currentNodeId].outputArgs,
                    inputTask: { ...res[nodeid]?.inputTask, [currentNodeId]: res[currentNodeId] },
                };
            } else {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    inputTask: { ...res[nodeid]?.inputTask, [currentNodeId]: res[currentNodeId] },
                };
            }
            makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
        }
    });
}

function graphdataobj2templatestructurefromEnd(data, res) {
    // 找到流程结束节点，end
    const { nodes, edges } = data;
    let endNode = nodes.find((item) => item.type === 'end');
    // 找其对应的边上所target节点
    let allfindEdgeIds = edges.filter((item) => item.targetNodeId === endNode.id).map((item) => item.sourceNodeId);
    let SourceNodes = nodes.filter((item) => allfindEdgeIds.indexOf(item.id) != -1);
    // 完善这些节点的输入组件
    SourceNodes.forEach((item) => {
        let tempproperties = item.properties;
        let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
        res[nodeid] = {
            ...tempproperties,
            ...res[nodeid], //合并inputtask
            outputTask: undefined,
        };
        makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
    });
}
function makeTaskOutputTaskConnection({ currentNode, currentNodeId, data, res }) {
    const { nodes, edges } = data;
    let allfindEdgeIds = edges.filter((item) => item.targetNodeId === currentNode.id).map((item) => item.sourceNodeId);
    let SourceNodes = nodes.filter((item) => allfindEdgeIds.indexOf(item.id) != -1);
    SourceNodes.forEach((item) => {
        if (item.type !== 'start') {
            let tempproperties = item.properties;
            let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
            if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    outputArgs: res[currentNodeId].inputArgs,
                    outputTask: { ...res[nodeid]?.outputTask, [currentNodeId]: res[currentNodeId] },
                };
            } else {
                res[nodeid] = {
                    ...tempproperties,
                    ...res[nodeid], //合并outputtask
                    outputTask: { ...res[nodeid]?.outputTask, [currentNodeId]: res[currentNodeId] },
                };
            }
            makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
        }
    });
}
export function graphdataobj2templatestructure(data) {
    let res = {};
    graphdataobj2templatestructurefromStart(data, res);
    graphdataobj2templatestructurefromEnd(data, res);
    return res;
}
export const allTemplatedata=[]
export const addTemplatedata=(data)=>{
    allTemplatedata.push(data) 
}
