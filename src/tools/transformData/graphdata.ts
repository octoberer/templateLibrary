import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { basicTaskDefine, template } from '../../define';
import { tempGraphrenderData } from './initialData';
import { getAllTaskList } from '.';
import { getTemplateInstanceId } from '../genTypeObj';

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
        makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
    });
}
function makeTaskInputTaskConnection({ currentNode, currentNodeId, data, res }) {
    const currentpar = currentNode.properties.par;
    const { nodes, edges, templateUniqueId } = data;
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
                        parId: templateUniqueId,
                    };
                } else if (item.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputTask: res[nodeid] ? [...res[nodeid]?.inputTask, currentNodeId] : [currentNodeId],
                        parId: templateUniqueId,
                        gen: false,
                    };
                }
            }
            // 外节点和内部的group建立联系,给group补充
            else if (currentpar === undefined && tempproperties.par != undefined) {
                debugger;
                let parProperties = tempproperties.par.properties;
                let parId = `${parProperties.id}_${parProperties.instanceId}`;
                if (item.type === 'processControlWaitAny' || item.type === 'processControlWaitAll') {
                    res[parId] = res[parId]
                        ? {
                              ...parProperties,
                              gen: false,
                              ...res[parId], //合并outputtask
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              inputTask: res[parId].inputTask[nodeid]
                                  ? { [nodeid]: [...res[parId].inputTask[nodeid], currentNodeId] }
                                  : { [nodeid]: currentNodeId },
                              parId: templateUniqueId,
                          }
                        : {
                              ...parProperties,
                              gen: false,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              inputTask: { [nodeid]: [currentNodeId] },
                              parId: templateUniqueId,
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
                              parId: templateUniqueId,
                              instanceId:getTemplateInstanceId(res[parId].id)
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              inputTask: { [nodeid]: [currentNodeId] },
                              parId: templateUniqueId,
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
                        parId: templateUniqueId,
                    };
                } else if (item.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        inputTask: res[nodeid] ? [...res[nodeid]?.inputTask, parId] : [parId],
                        parId: templateUniqueId,
                    };
                }
            }
            makeTaskInputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
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
        makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
    });
}
function makeTaskOutputTaskConnection({ currentNode, currentNodeId, data, res }) {
    const currentpar = currentNode.properties.par;
    const { nodes, edges, templateUniqueId } = data;
    let allfindEdgeIds = edges
        .filter((item: { targetNodeId: any }) => item.targetNodeId === currentNode.id)
        .map((item: { sourceNodeId: any }) => item.sourceNodeId);
    let SourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    SourceNodes.forEach((item: { type: string; properties: any }) => {
        if (item.type !== 'start') {
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
                        outputArgs: res[currentNodeId].inputArgs,
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, currentNodeId] : [currentNodeId],
                        parId: templateUniqueId,
                    };
                } else {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, currentNodeId] : [currentNodeId],
                        parId: templateUniqueId,
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
                              parId: templateUniqueId,
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              outputTask: { [nodeid]: [currentNodeId] },
                              parId: templateUniqueId,
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
                              parId: templateUniqueId,
                          }
                        : {
                              ...parProperties,
                              inputArgs: res[currentNodeId].outputArgs,
                              // 为模板补充inputTask
                              outputTask: { [nodeid]: [currentNodeId] },
                              parId: templateUniqueId,
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
                        parId: templateUniqueId,
                    };
                } else if (item.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        outputTask: res[nodeid] ? [...res[nodeid]?.outputTask, parId] : [parId],
                        parId: templateUniqueId,
                    };
                }
            }
            makeTaskOutputTaskConnection({ currentNode: item, currentNodeId: nodeid, data, res });
        }
    });
}

export function graphRenderData2TaskList(data: { nodes: any; edges: any; templateUniqueId: string }) {
    let res: { [id: string]: template | basicTaskDefine } = getAllTaskList();
    data = data || tempGraphrenderData;
    const { sourceNodes, targetNodes } = getAllSourceAndTargetNodes(data);
    debugger;
    graphdataobj2templatestructurefromStart(data, res, sourceNodes);
    graphdataobj2templatestructurefromEnd(data, res, targetNodes);
    const currentTaskList = res;
    sourceNodes.map((item) => (item.par ? item.par : item));
    return { currentTaskList, firstTasks: sourceNodes };
}
export const old2newgraphRenderData = (oldgraphData: { nodes: any; edges: any }, LFinstanceobj: LogicFlow) => {
    let { nodes, edges } = oldgraphData;
    const newnodes = [];
    const realnewnodes = [];
    // 找到group
    const allchildrennodes = [];
    const groupNodes = nodes.filter((node) => node.children != undefined);
    for (let group of groupNodes) {
        const childrennodes = group.children;
        for (let nodeid of childrennodes) {
            debugger;
            let node = nodes.filter((item) => item.id === nodeid)[0];
            allchildrennodes.push(nodeid);

            const newnode: BaseNodeModel | undefined = LFinstanceobj?.addNode({
                type: node.type,
                x: node.x,
                y: node.y,
                properties: node.properties,
            });
            newnodes.push(newnode);
            for (let edge of edges) {
                if (edge.targetNodeId === node.id) {
                    edge.targetNodeId = newnode?.id || '';
                }
                if (edge.sourceNodeId === node.id) {
                    edge.sourceNodeId = newnode?.id || '';
                }
            }
        }
        const newnodeIds = newnodes.map((item) => item?.id);
        const groupElem = {
            type: 'templateGroup',
            x: 300,
            y: 300,
            children: newnodeIds,
            properties: group.properties,
        };
        const realnewnode = LFinstanceobj?.addNode(groupElem);
        realnewnodes.push(realnewnode);
    }

    // 其他节点
    for (let node of nodes) {
        if (allchildrennodes.indexOf(node.id) < 0 && node.type == 'task') {
            const newnode: BaseNodeModel | undefined = LFinstanceobj?.addNode({
                type: node.type,
                x: node.x,
                y: node.y,
                properties: node.properties,
            });
            realnewnodes.push(newnode);
            for (let edge of edges) {
                if (edge.targetNodeId === node.id) {
                    edge.targetNodeId = newnode?.id || '';
                }
                if (edge.sourceNodeId === node.id) {
                    edge.sourceNodeId = newnode?.id || '';
                }
            }
        }
    }
    // 边
    for (let edge of edges) {
        LFinstanceobj?.addEdge({
            type: edge.type,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
        });
    }
    return { newnodes: realnewnodes, edges };
};
