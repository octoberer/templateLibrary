import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { basicTaskDefine, processControlDefine, template, templateTaskDefine } from '../../define';
import { tempGraphrenderData } from './initialData';
import { addTaskList, getAllTaskList, getTaskListByID } from '.';
import { addTemplateInstance, getTemplateInstanceId } from '../genTypeObj';
interface graphdataDefine {
    nodes: any;
    edges: any;
    topTemplateId: string;
}

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
function solveAllSourcenodes(
    data: graphdataDefine,
    sourceNodes: BaseNodeModel[],
    res: { [id: string]: template | templateTaskDefine | basicTaskDefine }
) {
    sourceNodes.forEach((node: BaseNodeModel) => {
        const { nodes, edges, topTemplateId } = data;
        let tempproperties = node.properties as basicTaskDefine;
        // 初始化没有parId
        let beConnectedParTaskkey = tempproperties.parId;
        let nodeUniqueId = getUniqueIdBynode(node);
        let allfindEdgeIds = edges
            .filter((item: { sourceNodeId: any }) => item.sourceNodeId === node.id)
            .map((item: { targetNodeId: any }) => item.targetNodeId);
        let targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
        if (targetNodes.length === 0 && !beConnectedParTaskkey) {
            res[nodeUniqueId] = {
                ...tempproperties,
                inputTask: [],
                parId: topTemplateId,
            };
        } else if (!beConnectedParTaskkey) {
            res[nodeUniqueId] = {
                ...tempproperties,
                inputTask: [],
            };
        }
        debugger;
        makeTaskInputTaskConnection({ beConnectedNode: node, res, targetNodes, data });
    });
}
function AllareNeedConnected(beConnectedParTaskkey, nodeparId, topTemplateId) {
    if (
        (beConnectedParTaskkey === undefined || beConnectedParTaskkey == topTemplateId) &&
        (nodeparId === undefined || nodeparId === topTemplateId)
    ) {
        return true;
    }
}
function makeTaskInputTaskConnection({
    beConnectedNode,
    res,
    targetNodes,
    data,
}: {
    beConnectedNode: BaseNodeModel;
    targetNodes: BaseNodeModel[];
    res: { [id: string]: template | templateTaskDefine | basicTaskDefine };
    data: graphdataDefine;
}) {
    const { nodes, edges, topTemplateId } = data;
    const beConnectedTaskkey = getUniqueIdBynode(beConnectedNode);
    const beConnectedParTaskkey = getTaskListByID(beConnectedTaskkey)?.parId;
    // 将每个目标节点与beConnectedNode建立inputtask的联系
    targetNodes.forEach((node: BaseNodeModel) => {
        if (node.type !== 'end') {
            let nodeid = getUniqueIdBynode(node);
            let nodeparId = getTaskListByID(nodeid)?.parId;
            // 同级节点不再重复建立关系
            if (beConnectedParTaskkey != undefined&&beConnectedParTaskkey != topTemplateId && nodeparId === beConnectedParTaskkey) {
            }
            // basicTask初始化建立关系
            else if (AllareNeedConnected(beConnectedParTaskkey, nodeparId, topTemplateId)) {
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    let properties = node.properties as processControlDefine;
                    let tempresobj = res[beConnectedTaskkey] as unknown as processControlDefine;
                    let res_nodeid = res[nodeid] as unknown as processControlDefine;
                    res_nodeid = res_nodeid
                        ? genResTaskobj({ ...res[nodeid], inputTask: mergeduplicates([...res[nodeid].inputTask, beConnectedTaskkey]) })
                        : genResTaskobj({
                              ...properties,
                              handleType: node.type,
                              inputTask: [beConnectedTaskkey],
                              parId: topTemplateId,
                              inputArgs: tempresobj.outputArgs,
                          });
                    res[nodeid] = res_nodeid;
                } else if (node.type === 'task') {
                    let properties = node.properties as basicTaskDefine;
                    res[nodeid] = res[nodeid]
                        ? genResTaskobj({ ...res[nodeid], inputTask: mergeduplicates([...res[nodeid].inputTask, beConnectedTaskkey]) })
                        : genResTaskobj({
                              ...properties,
                              handleType: node.type,
                              inputTask: [beConnectedTaskkey],
                              parId: topTemplateId,
                          });
                }
            }
            // 外节点和内部的group建立联系,给group补充
            else if (
                (beConnectedParTaskkey === undefined || beConnectedParTaskkey === topTemplateId) &&
                nodeparId != undefined &&
                nodeparId != topTemplateId
            ) {
                let templateTask = getTaskListByID(nodeparId) as templateTaskDefine;
                let instanceId = getTemplateInstanceId(nodeparId);
                let uniqueParId = `${nodeparId}_${instanceId}`;
                if (node.type === 'task') {
                    res[uniqueParId] = res[uniqueParId]
                        ? genResTaskobj({
                              ...res[uniqueParId], //合并outputtask
                              // 为模板补充inputTask
                              inputTask: res[uniqueParId].inputTask[nodeid]
                                  ? { [nodeid]: mergeduplicates([...res[uniqueParId].inputTask[nodeid], beConnectedTaskkey]) }
                                  : { [nodeid]: beConnectedTaskkey },
                          })
                        : genResTaskobj({
                              ...templateTask,
                              inputArgs: res[beConnectedTaskkey].outputArgs,
                              // 为模板初始化inputTask
                              inputTask: { [nodeid]: [beConnectedTaskkey] },
                              parId: topTemplateId,
                              instanceId,
                          });
                }
            }
            // 外节点和内部的group建立联系,给外界节点补充
            else if (beConnectedParTaskkey !== undefined && nodeparId === undefined) {
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    let processControlTask = getTaskListByID(nodeid) as processControlDefine;
                    res[nodeid] = res[nodeid]
                        ? genResTaskobj({
                              ...res[nodeid],
                              //合并inputTask
                              inputTask: mergeduplicates([...res[nodeid]?.inputTask, getUniqueIdBytemplateId(beConnectedParTaskkey)]),
                          })
                        : genResTaskobj({
                              ...processControlTask,
                              ...res[nodeid],
                              inputArgs: res[beConnectedTaskkey].outputArgs,
                              //初始化inputTask
                              inputTask: [getUniqueIdBytemplateId(beConnectedParTaskkey)],
                              parId: topTemplateId,
                          });
                } else if (node.type === 'task') {
                    let basicTask = getTaskListByID(nodeid) as basicTaskDefine;
                    res[nodeid] = res[nodeid]
                        ? genResTaskobj({
                              ...res[nodeid],
                              //合并inputTask
                              inputTask: mergeduplicates([...res[nodeid]?.inputTask, getUniqueIdBytemplateId(beConnectedParTaskkey)]),
                          })
                        : genResTaskobj({
                              ...basicTask,
                              ...res[nodeid],
                              inputTask: [getUniqueIdBytemplateId(beConnectedParTaskkey)],
                              parId: topTemplateId,
                          });
                }
            }
            let allfindEdgeIds = edges
                .filter((item: { sourceNodeId: any }) => item.sourceNodeId === node.id)
                .map((item: { targetNodeId: any }) => item.targetNodeId);
            let targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
            makeTaskInputTaskConnection({ beConnectedNode: node, res, targetNodes, data: data });
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
function solveAllTargetnodes(data: graphdataDefine, targetNodes: BaseNodeModel, res: { [x: string]: any }) {
    targetNodes.forEach((node: BaseNodeModel) => {
        let taskobj = getTaskListByID(getUniqueIdBynode(node));
        let nodeid = getUniqueIdBynode(node);
        if (!getTaskListByID(nodeid)) {
            res[nodeid] = {
                ...taskobj,
                ...res[nodeid], //合并inputtask
                outputTask: [],
                parId: data.topTemplateId,
            };
        }
        makeTaskOutputTaskConnection({ beConnectedNode: node, data, res });
    });
}
function makeTaskOutputTaskConnection({
    beConnectedNode,
    data,
    res,
}: {
    beConnectedNode: BaseNodeModel;
    data: graphdataDefine;
    res: { [id: string]: template | templateTaskDefine | basicTaskDefine };
}) {
    const beConnectedParTaskkey = getTaskListByID(getUniqueIdBynode(beConnectedNode))?.parId;
    const beConnectedTaskkey = getUniqueIdBynode(beConnectedNode);
    const { nodes, edges, topTemplateId } = data;
    let allfindEdgeIds = edges
        .filter((item: { targetNodeId: any }) => item.targetNodeId === beConnectedNode.id)
        .map((item: { sourceNodeId: any }) => item.sourceNodeId);
    let SourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
    SourceNodes.forEach((node: BaseNodeModel) => {
        if (node.type !== 'start') {
            let tempproperties = node.properties;
            let nodeid = getUniqueIdBynode(node);
            let nodeParid = getTaskListByID(nodeid)?.parId;
            debugger
            // 同级节点不再重复建立关系
            if (beConnectedParTaskkey != undefined&&beConnectedParTaskkey != topTemplateId && nodeParid === beConnectedParTaskkey) {
            }
            // basicTask初始化建立关系
            else if (AllareNeedConnected(beConnectedParTaskkey, nodeParid, topTemplateId)) {
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    res[nodeid] = genResTaskobj({
                        ...tempproperties,
                        ...res[nodeid],
                        outputArgs: res[beConnectedTaskkey].inputArgs,
                        outputTask: res[nodeid] ? mergeduplicates([...res[nodeid]?.outputTask, beConnectedTaskkey]) : [beConnectedTaskkey],
                        parId: topTemplateId,
                    });
                } else if (node.type === 'task') {
                    res[nodeid] = {
                        ...tempproperties,
                        ...res[nodeid], //合并outputtask
                        outputTask: res[nodeid] ? mergeduplicates([...res[nodeid]?.outputTask, beConnectedTaskkey] ): [beConnectedTaskkey],
                        parId: topTemplateId,
                    };
                }
            }
            // 外节点和内部的group建立联系
            else if ((beConnectedParTaskkey === undefined || beConnectedParTaskkey === topTemplateId) && nodeParid != undefined) {
                let templateTaskobj = getTaskListByID(nodeParid);
                let instanceId = getTemplateInstanceId(nodeParid);
                let uniqueParId = `${nodeParid}_${instanceId}`;
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    res[uniqueParId] = res[uniqueParId]
                        ? {
                              ...res[uniqueParId], //合并outputtask
                              outputArgs: res[beConnectedTaskkey].inputArgs,
                              // 为模板补充inputTask
                              outputTask: res[uniqueParId].outputTask[nodeid]
                                  ? { [nodeid]: mergeduplicates([...res[uniqueParId].outputTask[nodeid], beConnectedTaskkey]) }
                                  : { [nodeid]: [beConnectedTaskkey] },
                          }
                        : {
                              ...templateTaskobj,
                              outputArgs: res[beConnectedTaskkey].inputArgs,
                              // 为模板初始化outputTask
                              outputTask: { [nodeid]: [beConnectedTaskkey] },
                              parId: topTemplateId,
                              instanceId,
                          };
                } else if (node.type === 'task') {
                    res[uniqueParId] = res[uniqueParId]
                        ? {
                              ...res[uniqueParId], //合并outputtask
                              // 为模板补充inputTask
                              outputTask: res[uniqueParId].outputTask[nodeid]
                                  ? { [nodeid]: mergeduplicates([...res[uniqueParId].outputTask[nodeid], beConnectedTaskkey]) }
                                  : { [nodeid]: [beConnectedTaskkey] },
                          }
                        : {
                              ...templateTaskobj,
                              inputArgs: res[beConnectedTaskkey].outputArgs,
                              // 为模板补充inputTask
                              outputTask: { [nodeid]: [beConnectedTaskkey] },
                              parId: topTemplateId,
                              instanceId: getTemplateInstanceId(templateTaskobj.id),
                          };
                }
            }
            // 外节点和内部的group建立联系,给外界节点补充
            else if (beConnectedParTaskkey !== undefined && nodeParid === undefined) {
                let basicTaskobj = getTaskListByID(nodeid) || {};
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    res[nodeid] = {
                        ...basicTaskobj,
                        ...res[nodeid], //合并outputtask
                        outputArgs: res[beConnectedTaskkey].inputArgs,
                        outputTask: res[nodeid]
                            ?mergeduplicates( [...res[nodeid]?.outputTask, getUniqueIdBytemplateId(beConnectedParTaskkey)])
                            : [getUniqueIdBytemplateId(beConnectedParTaskkey)],
                        parId: topTemplateId,
                    };
                } else if (node.type === 'task') {
                    res[nodeid] = {
                        ...basicTaskobj,
                        ...res[nodeid], //合并outputtask
                        outputTask: res[nodeid]
                            ? mergeduplicates([...res[nodeid]?.outputTask, getUniqueIdBytemplateId(beConnectedParTaskkey)])
                            : [getUniqueIdBytemplateId(beConnectedParTaskkey)],
                        parId: topTemplateId,
                    };
                }
            }
            makeTaskOutputTaskConnection({ beConnectedNode: node, data, res });
        }
    });
}

export function graphRenderData2TaskList(data: { nodes: any; edges: any; topTemplateId: string }) {
    let res: { [id: string]: template | templateTaskDefine | basicTaskDefine } = getAllTaskList();
    debugger;
    data = data || tempGraphrenderData;
    const { sourceNodes, targetNodes } = getAllSourceAndTargetNodes(data);
    // 新增当前模板的字模板对象
    addChildTemplateInstance();
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
function addChildTemplateInstance() {
    const allTaskList = getAllTaskList();
    for (let uniqueid in allTaskList) {
        if (allTaskList[uniqueid].memoChildren) {
            addTemplateInstance(allTaskList[uniqueid].id);
        }
    }
}
function getUniqueIdBynode(node: BaseNodeModel) {
    return `${node.properties.id}_${node.properties.instanceId}`;
}
function genResTaskobj(obj: templateTaskDefine | basicTaskDefine | processControlDefine) {
    const { id, instanceId, handleType, inputTask, outputTask, parId, inputArgs, outputArgs, inputhandlArg, outputhandlArg, handle } = obj;
    if (handleType == 'templateGroup') {
        return {
            id,
            instanceId,
            inputArgs,
            outputArgs,
            inputTask,
            outputTask,
            handleType: 'templateGroup',
            handle,
            parId,
        };
    }
    if (handleType == 'processControlWaitAny' || handleType == 'processControlWaitAll') {
        return {
            id,
            instanceId,
            inputArgs,
            outputArgs,
            inputTask,
            outputTask,
            handleType,
            parId,
        };
    }
    if (handleType === 'task') {
        return {
            id,
            instanceId,
            outputhandlArg,
            inputhandlArg,
            inputArgs,
            outputArgs,
            inputTask,
            outputTask,
            handleType: 'task',
            handle,
            parId,
        };
    }
    return {
        id,
        instanceId,
        outputhandlArg,
        inputhandlArg,
        inputArgs,
        outputArgs,
        inputTask,
        outputTask,
        handleType: 'task',
        handle,
        parId,
    };
}
function getUniqueIdBytemplateId(id: string | number) {
    let instanceId = getTemplateInstanceId(id);
    return `${id}_${instanceId}`;
}
function mergeduplicates(arr:any[]){
    return [...new Set(arr)]
}