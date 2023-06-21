import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import {
    basicTaskDefine,
    basicTaskInstanceDefine,
    processControlDefine,
    template,
    templateTaskDefine,
    templateTaskInstanceDefine,
} from '../../define';
import { tempGraphrenderData } from './initialData';

import {
    addandGetTaskinstanceId,
    addandGetTemplateInstance,
    getAllTaskList,
    getTaskListByID,
    getTaskinstanceId,
    getTemplateInstanceId,
} from '../genTypeObj';
export interface graphdataDefine {
    nodes: any;
    edges: any;
    topTemplateId: string;
}

export const getAllSourceAndTargetNodes = (data: { nodes: any; edges: any }) => {
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
    sourceNodes: { properties: any }[],
    AlreadyInstanceNodeIds: string[]
) {
    // 得到源节点作为空节点的targetnodes，来完善这些节点的inputTask
    solveAllSourcenodes(data, sourceNodes, res, AlreadyInstanceNodeIds);
}
function solveAllSourcenodes(
    data: graphdataDefine,
    sourceNodes: BaseNodeModel[],
    res: {
        [id: string]: template | templateTaskDefine | basicTaskDefine;
    },
    AlreadyInstanceNodeIds: string[]
) {
    sourceNodes.forEach((node: BaseNodeModel) => {
        const { nodes, edges, topTemplateId } = data;
        const allfindEdgeIds = edges
            .filter((item: { sourceNodeId: any }) => item.sourceNodeId === node.id)
            .map((item: { targetNodeId: any }) => item.targetNodeId);
        const targetNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
        makeTaskConnection({
            beConnectedNode: node,
            data,
            res,
            flagNode: 'end',
            Task: 'inputTask',
            Nodes: targetNodes,
            AlreadyInstanceNodeIds,
        });
    });
}
export const instanceBasicTask = (res: any, node: BaseNodeModel, parId: string) => {
    debugger;
    const id = node.properties.id;
    const tempobj: basicTaskInstanceDefine = {
        id,
        instanceId: addandGetTaskinstanceId(id),
        parId,
        inputTaskKeys: [],
        outputTaskKeys: [],
    };
    res[`${id}_${tempobj.instanceId}`] = tempobj;
    return `${id}_${tempobj.instanceId}`;
};
export const getUniqueIdByBasicTaskId = (id) => {
    return `${id}_${getTaskinstanceId(id)}`;
};
export const instanceTemplateTask = (res, template, topTemplateId,GroupNode) => {
    debugger;
    const instanceId = addandGetTemplateInstance(template.id);
    template.instancefy = true;
    const templateTask: templateTaskDefine = {
        id: template.id,
        instanceId: instanceId,
        parId: topTemplateId,
        inputTaskKeys: [],
        outputTaskKeys: [],
        memoChildren: [],
        x:GroupNode.x,
        y:GroupNode.y,
        width:GroupNode.width,
        height:GroupNode.height
    };
    const uniqueId = `${template.id}_${instanceId}`;
    res[uniqueId] = templateTask;
    return uniqueId;
};
//  嵌套中和basicTask同级的，只需改变其parId
const instanceGroupTemplate = (res, key, parId) => {
    const [id, instanceId] = key.split('_');
    const tempobj: templateTaskInstanceDefine = {
        id,
        instanceId,
        taskInstanceId: addandGettemplateTaskinstanceId(id, instanceId),
        parId,
        memoChildren: [],
    };
    res[`${id}_${tempobj.instanceId}`] = tempobj;
    return `${id}_${tempobj.instanceId}`;
};
const instanceGroupTask = (res, key, parId) => {
    debugger;
    const id = key.split('_')[0];
    const tempobj: basicTaskInstanceDefine = {
        id,
        instanceId: addandGetTaskinstanceId(id),
        parId,
        inputTaskKeys: [],
        outputTaskKeys: [],
    };
    res[`${id}_${tempobj.instanceId}`] = tempobj;
    return `${id}_${tempobj.instanceId}`;
};
const recursionCreateInstance = (res: { [x: string]: any }, TemplateUniqueId: string, memochildren: any[]) => {
    debugger;
    const children = getTaskListByID(TemplateUniqueId.split('_')[0]).memoChildren;
    children.forEach((childkey: string) => {
        if (getTaskListByID(childkey.split('_')[0]).handleType != 'templateGroup') {
            const id = instanceGroupTask(res, childkey, TemplateUniqueId);
            memochildren.push(id);
        } else {
            const innermemochildren: any[] = [];
            const id = instanceGroupTemplate(res, childkey, TemplateUniqueId);
            memochildren.push(id);
            recursionCreateInstance(res, TemplateUniqueId, innermemochildren);
            res[id].memoChildren = [...innermemochildren];
        }
    });
};

export const getTemplate = (parId: string) => {
    let tempNodeparId = parId;
    let a = getTaskListByID(parId);
    let layer = 0;
    while (a.handleType != 'templateGroup') {
        tempNodeparId = a.parId;
        a = getTaskListByID(tempNodeparId);
        layer++;
    }
    return { template: a, layer };
function makeTaskConnection({
    beConnectedNode,
    res,
    Nodes,
    data,
    flagNode,
    Task,
    AlreadyInstanceNodeIds,
}: {
    beConnectedNode: BaseNodeModel;
    Nodes: BaseNodeModel[];
    res: {
        [id: string]: template | templateTaskDefine | basicTaskDefine;
    };
    data: graphdataDefine;
    flagNode: 'start' | 'end';
    Task: 'inputTask' | 'outputTask';
    AlreadyInstanceNodeIds: string[];
}) {
    const { nodes, edges, topTemplateId } = data;
    let beConnectedTaskkey = getUniqueIdBynode(beConnectedNode);
    const beConnectedParTaskkey = getParIdBynode(beConnectedNode);
    // 将每个目标节点与beConnectedNode建立联系
    Nodes.forEach((node: BaseNodeModel) => {
        if (node.type !== flagNode) {
            let nodeid = getUniqueIdBynode(node);
            const nodeparId = getParIdBynode(node);
            //   task对应task
            if (nodeparId === undefined && beConnectedParTaskkey === undefined) {
                //实例化这两个basictask,为其添加inputtask
                if (AlreadyInstanceNodeIds.indexOf(node.id) < 0) {
                    res[nodeid] = { ...node.properties };
                    instanceBasicTask(res, node, topTemplateId);
                    AlreadyInstanceNodeIds.push(node.id);
                }
                if (AlreadyInstanceNodeIds.indexOf(beConnectedNode.id) < 0) {
                    res[beConnectedTaskkey] = { ...beConnectedNode.properties };
                    instanceBasicTask(res, beConnectedNode, topTemplateId);
                    AlreadyInstanceNodeIds.push(beConnectedNode.id);
                }
                nodeid = getUniqueIdByBasicTaskId((nodeid + '').split('_')[0]);
                beConnectedTaskkey = getUniqueIdByBasicTaskId((beConnectedTaskkey + '').split('_')[0]);

                Task == 'inputTask'
                    ? (res[nodeid].inputTaskKeys = mergeduplicates([...res[nodeid].inputTaskKeys, beConnectedTaskkey]))
                    : (res[nodeid].outputTaskKeys = mergeduplicates([...res[nodeid].outputTaskKeys, beConnectedTaskkey]));
                if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                    nodeid = (nodeid + '').split('_')[0];
                    beConnectedTaskkey = (beConnectedTaskkey + '').split('_')[0];
                    Task == 'inputTask'
                        ? (res[nodeid].inputArgs = [...res[nodeid].inputArgs, ...res[beConnectedTaskkey].outputArgs])
                        : (res[nodeid].outputArgs = [...res[nodeid].outputArgs, ...res[beConnectedTaskkey].inputArgs]);
                }
            }
            //task对应group
            else if (nodeparId !== undefined && beConnectedParTaskkey === undefined) {
                //实例化该group,从顶层实例化到节点,找到当前top模板
                const { template } = getTemplate(nodeparId);
                let TemplateUniqueId;
                if (AlreadyInstanceNodeIds.indexOf(beConnectedNode.id) < 0) {
                    res[beConnectedTaskkey] = { ...beConnectedNode.properties };
                    beConnectedTaskkey = instanceBasicTask(res, beConnectedNode, topTemplateId);
                    AlreadyInstanceNodeIds.push(beConnectedNode.id);
                }
                if (!template.instancefy) {
                    TemplateUniqueId = instanceTemplateTask(res, template, topTemplateId);
                    const memochildren: string[] = [];
                    recursionCreateInstance(res, TemplateUniqueId, memochildren);
                    res[TemplateUniqueId].memochildren = memochildren;
                }
                TemplateUniqueId = getUniqueIdBytemplateId(template.id);
                // 添加inputtask
                nodeid = getUniqueIdByBasicTaskId((nodeid + '').split('_')[0]);
                beConnectedTaskkey = getUniqueIdByBasicTaskId((beConnectedTaskkey + '').split('_')[0]);

                const relations = [];
                let temp = nodeid;
                while (res[temp]) {
                    temp = res[temp].parId;
                    relations.push(temp);
                }

                Task == 'inputTask'
                    ? (res[TemplateUniqueId].inputTaskKeys = mergeduplicates([
                          ...res[TemplateUniqueId].inputTaskKeys,
                          {
                              source: beConnectedTaskkey,
                              sourcerelations: [],
                              target: nodeid,
                              targetrelations: relations,
                          },
                      ]))
                    : (res[TemplateUniqueId].outputTaskKeys = mergeduplicates([
                          ...res[TemplateUniqueId].outputTaskKeys,
                          {
                              source: nodeid,
                              sourcerelations: relations,
                              target: beConnectedTaskkey,
                              targetrelations: [],
                          },
                      ]));
            } else if (nodeparId === undefined && beConnectedParTaskkey !== undefined) {
                debugger;
                // 找到当前top模板
                const { template } = getTemplate(beConnectedParTaskkey);
                let TemplateUniqueId;
                if (!template.instancefy) {
                    TemplateUniqueId = instanceTemplateTask(res, template, topTemplateId);
                    const memochildren: string[] = [];
                    recursionCreateInstance(res, TemplateUniqueId, memochildren);
                    res[TemplateUniqueId].memochildren = memochildren;
                }
                // 实例化该basictasknode
                if (AlreadyInstanceNodeIds.indexOf(node.id) < 0) {
                    res[nodeid] = { ...node.properties };
                    instanceBasicTask(res, node, topTemplateId);
                    AlreadyInstanceNodeIds.push(node.id);
                }
                nodeid = getUniqueIdByBasicTaskId((nodeid + '').split('_')[0]);
                beConnectedTaskkey = getUniqueIdByBasicTaskId((beConnectedTaskkey + '').split('_')[0]);
                TemplateUniqueId = getUniqueIdBytemplateId(template.id);
                Task == 'inputTask'
                    ? (res[nodeid].inputTaskKeys = mergeduplicates([...res[nodeid].inputTaskKeys, TemplateUniqueId]))
                    : (res[nodeid].outputTaskKeys = mergeduplicates([...res[nodeid].outputTaskKeys, TemplateUniqueId]));
            } else if (nodeparId !== undefined && beConnectedParTaskkey !== undefined) {
                // group对应group
                const { template } = getTemplate(beConnectedParTaskkey);
                debugger;
                if (!template.instancefy) {
                    const TemplateUniqueId = instanceTemplateTask(res, template, topTemplateId);
                    const memochildren: string[] = [];
                    recursionCreateInstance(res, TemplateUniqueId, memochildren);
                    res[TemplateUniqueId].memochildren = memochildren;
                }
                // 添加inputtask
                nodeid = getUniqueIdByBasicTaskId((nodeid + '').split('_')[0]);
                beConnectedTaskkey = getUniqueIdByBasicTaskId((beConnectedTaskkey + '').split('_')[0]);

                const relations1 = [];
                let temp = nodeid;
                while (res[temp]) {
                    temp = res[temp].parId;
                    relations1.push(temp);
                }
                // 被连接的节点,找到当前top模板
                const { template: beConnectedtemplate } = getTemplate(beConnectedParTaskkey);
                if (!beConnectedtemplate.instancefy) {
                    const TemplateUniqueId = instanceTemplateTask(res, beConnectedtemplate, topTemplateId);
                    const memochildren: string[] = [];
                    recursionCreateInstance(res, TemplateUniqueId, memochildren);
                    res[TemplateUniqueId].memochildren = memochildren;
                }
                const relations2 = [];
                let temp1 = beConnectedTaskkey;
                while (res[temp1]) {
                    temp1 = res[temp1].parId;
                    relations2.push(temp1);
                }
                let TemplateUniqueId = getUniqueIdBytemplateId(template.id);
                const isSameTemplate = (nodeparId, beConnectedParTaskkey) => {
                    const { template, layer: templatelayer } = getTemplate(nodeparId);
                    const { template: beConnectedtemplate, layer: beConnectedtemplatelayer } = getTemplate(beConnectedParTaskkey);
                    return { same: beConnectedtemplate.id === template.id,template, templatelayer, beConnectedtemplatelayer };
                };
                // 判断当前两个节点是否在一个组里
                const { same,template:templateobj, templatelayer, beConnectedtemplatelayer } = isSameTemplate(nodeparId, beConnectedParTaskkey);
                if (nodeparId === beConnectedParTaskkey) {
                    Task == 'inputTask'
                        ? (res[nodeid].inputTaskKeys = mergeduplicates([...res[nodeid].inputTaskKeys, beConnectedTaskkey]))
                        : (res[nodeid].outputTaskKeys = mergeduplicates([...res[nodeid].outputTaskKeys, beConnectedTaskkey]));
                    if (node.type === 'processControlWaitAny' || node.type === 'processControlWaitAll') {
                        nodeid = (nodeid + '').split('_')[0];
                        beConnectedTaskkey = (beConnectedTaskkey + '').split('_')[0];
                        Task == 'inputTask'
                            ? (res[nodeid].inputArgs = [...res[nodeid].inputArgs, ...res[beConnectedTaskkey].outputArgs])
                            : (res[nodeid].outputArgs = [...res[nodeid].outputArgs, ...res[beConnectedTaskkey].inputArgs]);
                    }
                }
                // 存在一个组里，但不在同一层
                else if (nodeparId !== beConnectedParTaskkey && same) {
                    if (templatelayer > beConnectedtemplatelayer) {
                      TemplateUniqueId=getUniqueIdBytemplateId(templateobj)
                        Task == 'inputTask'
                            ? (res[TemplateUniqueId].inputTaskKeys = mergeduplicates([
                                  ...res[TemplateUniqueId].inputTaskKeys,
                                  {
                                      source: beConnectedTaskkey,
                                      sourcerelations: relations2,
                                      target: nodeid,
                                      targetrelations: relations1,
                                  },
                              ]))
                            : (res[TemplateUniqueId].outputTaskKeys = mergeduplicates([
                                  ...res[TemplateUniqueId].outputTaskKeys,
                                  {
                                      source: nodeid,
                                      sourcerelations: relations1,
                                      target: beConnectedTaskkey,
                                      targetrelations: relations2,
                                  },
                              ]));
                    }
                }
                Task == 'inputTask'
                    ? (res[TemplateUniqueId].inputTaskKeys = mergeduplicates([
                          ...res[TemplateUniqueId].inputTaskKeys,
                          {
                              source: beConnectedTaskkey,
                              sourcerelations: relations2,
                              target: nodeid,
                              targetrelations: relations1,
                          },
                      ]))
                    : (res[TemplateUniqueId].outputTaskKeys = mergeduplicates([
                          ...res[TemplateUniqueId].outputTaskKeys,
                          {
                              source: nodeid,
                              sourcerelations: relations1,
                              target: beConnectedTaskkey,
                              targetrelations: relations2,
                          },
                      ]));
            }
            let Nodes = [];
            if (Task == 'inputTask') {
                let allfindEdgeIds = edges
                    .filter((item: { sourceNodeId: any }) => item.sourceNodeId === node.id)
                    .map((item: { targetNodeId: any }) => item.targetNodeId);
                Nodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
            } else {
                let allfindEdgeIds = edges
                    .filter((item: { targetNodeId: any }) => item.targetNodeId === node.id)
                    .map((item: { sourceNodeId: any }) => item.sourceNodeId);
                Nodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
            }
            makeTaskConnection({
                beConnectedNode: node,
                res,
                Nodes,
                data: data,
                flagNode,
                Task,
                AlreadyInstanceNodeIds,
            });
        }
    });
}

function graphdataobj2templatestructurefromEnd(
    data: { nodes: any; edges: any },
    res: { [x: string]: any },
    targetNodes: { properties: any }[],
    AlreadyInstanceNodeIds: string[]
) {
    // 完善这些节点的输入组件
    solveAllTargetnodes(data, targetNodes, res, AlreadyInstanceNodeIds);
}
function solveAllTargetnodes(
    data: graphdataDefine,
    targetNodes: BaseNodeModel,
    res: { [x: string]: any },
    AlreadyInstanceNodeIds: string[]
) {
    targetNodes.forEach((node: BaseNodeModel) => {
        const { nodes, edges, topTemplateId } = data;
        let taskobj = getTaskListByID(getUniqueIdBynode(node));
        let nodeid = getUniqueIdBynode(node);
        if (!getTaskListByID(nodeid)) {
            res[nodeid] = {
                ...taskobj,
                ...res[nodeid], //合并inputtask
                outputTask: [],
            };
        }
        let allfindEdgeIds = edges
            .filter((item: { targetNodeId: any }) => item.targetNodeId === node.id)
            .map((item: { sourceNodeId: any }) => item.sourceNodeId);
        let sourceNodes = nodes.filter((item: { id: any }) => allfindEdgeIds.indexOf(item.id) != -1);
        makeTaskConnection({
            beConnectedNode: node,
            data,
            Nodes: sourceNodes,
            res,
            flagNode: 'start',
            Task: 'outputTask',
            AlreadyInstanceNodeIds,
        });
    });
}

 function graphRenderData2TaskListCore(data: { nodes: any; edges: any; topTemplateId: string }) {
    const res: {
        [id: string]: template | templateTaskDefine | basicTaskDefine;
    } = { ...getAllTaskList() };
    data = data || tempGraphrenderData;
    const { sourceNodes, targetNodes } = getAllSourceAndTargetNodes(data);
    const AlreadyInstanceNodeIds: string[] = [];
    graphdataobj2templatestructurefromStart(data, res, sourceNodes, AlreadyInstanceNodeIds);
    graphdataobj2templatestructurefromEnd(data, res, targetNodes, AlreadyInstanceNodeIds);
    for (let key in res) {
        if (res[key].handleType == 'templateGroup') {
            res[key].instancefy = false;
        }
    }
    const currentTaskList = res;
    return { currentTaskList, sourceNodes };
}
export function getUniqueIdBynode(node: BaseNodeModel) {
    if (!node.properties.instanceId) {
        return node.properties.id;
    }
    return `${node.properties.id}_${node.properties.instanceId}`;
}
export function getParIdBynode(node: BaseNodeModel) {
    return node.properties.parId;
}
export function getUniqueIdBytemplateId(id: string | number) {
    const instanceId = getTemplateInstanceId(id);
    return `${id}_${instanceId}`;
}
export function mergeduplicates(arr: any[]) {
    const newarr = [];
    const strarr = [];
    console.log('arr', arr);
    for (const item of arr) {
        if (item.source) {
            const str = item.source + '_' + item.target;
            if (strarr.indexOf(str) < 0) {
                newarr.push(item);
                strarr.push(str);
            }
        } else {
            if (newarr.indexOf(item) < 0) {
                newarr.push(item);
            }
        }
    }
    return newarr;
}
