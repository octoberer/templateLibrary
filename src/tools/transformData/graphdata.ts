import { tempGraphrenderData } from './initialData';

const getAllSourceAndTargetNodes = (data: { nodes: any; edges: any }) => {
    // 找到流程开始节点，start
    let { nodes, edges } = data;
    nodes = nodes.filter((node: { type: string }) => node.type != 'templateGroup');
    let startNode = nodes.find((item: { type: string }) => item.type === 'start');
    let endNode = nodes.find((item: { type: string }) => item.type === 'end');
    let sourceNodes = [];
    let targetNodes = [];
    if (startNode) {
        let allfindEdgeIds = edges
            .filter((item: { sourceNodeId: any }) => item.sourceNodeId === startNode.id)
            .map((item: { targetNodeId: any }) => item.targetNodeId);
        sourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    } else {
        let haveSourceNodes: any[] = [];
        edges.forEach((item) => {
            if (haveSourceNodes.indexOf(item.targetNodeId) < 0) {
                haveSourceNodes.push(item.targetNodeId);
            }
        });
        sourceNodes = nodes.filter((item) => haveSourceNodes.indexOf(item.id) < 0);
    }
    if (endNode) {
        let allfindEdgeIds = edges
            .filter((item: { targetNodeId: any }) => item.targetNodeId === endNode.id)
            .map((item: { sourceNodeId: any }) => item.sourceNodeId);
        targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    } else {
        let havetargetNodes: any[] = [];
        edges.forEach((item) => {
            if (havetargetNodes.indexOf(item.sourceNodeId) < 0) {
                havetargetNodes.push(item.sourceNodeId);
            }
        });
        targetNodes = nodes.filter((item) => havetargetNodes.indexOf(item.id) < 0);
    }
    return { sourceNodes, targetNodes };
};

function graphdataobj2templatestructurefromStart(
    data: { nodes: any; edges: any },
    res: { [x: string]: any },
    sourceNodes: { properties: any }[]
) {
    // 得到源节点作为空节点的targetnodes，来完善这些节点的inputTask

    solveAllSourcenodes(data, sourceNodes, res);
}
function solveAllSourcenodes(data: { nodes: any; edges: any }, sourceNodes: { properties: any }[], res: { [x: string]: any }) {
    sourceNodes.forEach((item: { properties: any }) => {
        let tempproperties = item.properties;
        let currentpar = tempproperties.par;
        let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
        if (!currentpar) {
            res[nodeid] = {
                ...tempproperties,
                inputTask: [],
            };
        }
        makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res, currentpar });
    });
}
function makeTaskInputTaskConnection({ currentNode, currentNodeId, data, res, currentpar }) {
    const { nodes, edges } = data;
    let allfindEdgeIds = edges
        .filter((item: { sourceNodeId: any }) => item.sourceNodeId === currentNode.id)
        .map((item: { targetNodeId: any }) => item.targetNodeId);
    let targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    // 将每个目标节点与currentNode建立inputtask的联系
    targetNodes.forEach((item: { type: string; properties: any }) => {
        if (item.type !== 'end') {
            let tempproperties = item.properties;
            let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
            // 同级节点不再重复建立关系
            if (currentpar != undefined && tempproperties.par === currentpar) {
            }
            // basicTask初始化建立关系
            else if (currentpar === undefined && tempproperties.par === undefined) {
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputArgs: res[currentNodeId].outputArgs,
                        inputTask: res[nodeid] ? [...res[nodeid]?.inputTask, currentNodeId] : [currentNodeId],
                    };
                } else if (item.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputTask: res[nodeid] ? [...res[nodeid]?.inputTask, currentNodeId] : [currentNodeId],
                    };
                }
            }
            // 外节点和内部的group建立联系,给group补充
            else if (currentpar === undefined && tempproperties.par != undefined) {
                let parProperties = tempproperties.par.properties;
                let parId = `${parProperties.id}_${parProperties.instanceId}`;
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[parId] = res[parId]
                        ? {
                              ...parProperties,
                              ...res[parId], //合并outputtask
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              inputTask: res[parId].inputTask[nodeid]
                                  ? { [nodeid]: [...res[parId].inputTask[nodeid], currentNodeId] }
                                  : { [nodeid]: currentNodeId },
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              inputTask: { [nodeid]: [currentNodeId] },
                          };
                } else if (item.type === 'task') {
                    res[parId] = res[parId]
                        ? {
                              ...parProperties,
                              ...res[parId], //合并outputtask
                              // 为模板补充inputTask
                              inputTask: res[parId].inputTask[nodeid]
                                  ? { [nodeid]: [...res[parId].inputTask[nodeid], currentNodeId] }
                                  : { [nodeid]: currentNodeId },
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              inputTask: { [nodeid]: [currentNodeId] },
                          };
                }
            }
            // 外节点和内部的group建立联系,给外界节点补充
            else if (currentpar !== undefined && tempproperties.par === undefined) {
                let parProperties = currentpar.properties;

                let parId = `${parProperties.id}_${parProperties.instanceId}`;
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputArgs: res[currentNodeId].outputArgs,
                        inputTask: res[nodeid] ? [...res[nodeid]?.inputTask, parId] : [parId],
                    };
                } else if (item.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputTask: res[nodeid] ? [...res[nodeid]?.inputTask, parId] : [parId],
                    };
                }
            }
            makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res, currentpar });
        }
    });
}

function graphdataobj2templatestructurefromEnd(
    data: { nodes: any; edges: any },
    res: { [x: string]: any },
    targetNodes: { properties: any }[]
) {
    // 完善这些节点的输入组件
    solveAllTargetnodes(data, targetNodes, res);
}
function solveAllTargetnodes(data: { nodes: any; edges: any }, targetNodes: { properties: any }[], res: { [x: string]: any }) {
    targetNodes.forEach((item: { properties: any }) => {
        let tempproperties = item.properties;
        let currentpar = tempproperties.par;
        let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
        if (!currentpar) {
            res[nodeid] = {
                ...tempproperties,
                ...res[nodeid], //合并inputtask
                outputTask: [],
            };
        }
        makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res, currentpar });
    });
}
function makeTaskOutputTaskConnection({ currentNode, currentNodeId, data, res, currentpar }) {
    const { nodes, edges } = data;
    let allfindEdgeIds = edges
        .filter((item: { targetNodeId: any }) => item.targetNodeId === currentNode.id)
        .map((item: { sourceNodeId: any }) => item.sourceNodeId);
    let SourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    SourceNodes.forEach((item: { type: string; properties: any }) => {
        if (item.type !== 'start') {
            let tempproperties = item.properties;
            let nodeid = `${tempproperties.id}_${tempproperties.instanceId}`;
            // 同级节点不再重复建立关系
            if (currentpar != undefined && tempproperties.par === currentpar) {}
            // basicTask初始化建立关系
            else if (currentpar === undefined && tempproperties.par === undefined) {
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        outputArgs: res[currentNodeId].inputArgs,
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, currentNodeId] : [currentNodeId],
                    };
                } else {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, currentNodeId] : [currentNodeId],
                    };
                }
            }
            // 外节点和内部的group建立联系
            else if (currentpar === undefined && tempproperties.par != undefined) {
                let parProperties = tempproperties.par.properties;
                let parId = `${tempproperties.par.properties.id}_${tempproperties.par.properties.instanceId}`;
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[parId] = res[parId]
                        ? {
                              ...parProperties,
                              ...res[parId], //合并outputtask
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              outputTask: res[parId].outputTask[nodeid]
                                  ? { [nodeid]: [...res[parId].outputTask[nodeid], currentNodeId] }
                                  : { [nodeid]: [currentNodeId] },
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              outputTask: { [nodeid]: [currentNodeId] },
                          };
                } else if (item.type === 'task') {
                    res[parId] = res[parId]
                        ? {
                              ...parProperties,
                              ...res[parId], //合并outputtask
                              // 为模板补充inputTask
                              outputTask: res[parId].outputTask[nodeid]
                                  ? { [nodeid]: [...res[parId].outputTask[nodeid], currentNodeId] }
                                  : { [nodeid]: [currentNodeId] },
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              outputTask: { [nodeid]: [currentNodeId] },
                          };
                }
            }
            // 外节点和内部的group建立联系,给外界节点补充
            else if (currentpar !== undefined && tempproperties.par === undefined) {
                let parProperties = currentpar.properties;
                let parId = `${parProperties.id}_${parProperties.instanceId}`;
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputArgs: res[currentNodeId].outputArgs,
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, parId] : [parId],
                    };
                } else if (item.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, parId] : [parId],
                    };
                }
            }
            makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res, currentpar });
        }
    });
}

export function graphRenderData2TaskList(data: { nodes: any; edges: any }) {
    let res = {};
    data = data || tempGraphrenderData;
    const { sourceNodes, targetNodes } = getAllSourceAndTargetNodes(data);
    debugger;
    graphdataobj2templatestructurefromStart(data, res, sourceNodes);
    graphdataobj2templatestructurefromEnd(data, res, targetNodes);
    console.log('res', res);
    const currentTaskList=res
    sourceNodes.map(item=>item.par?item.par:item)
    return {currentTaskList,firstTasks:sourceNodes};
}
