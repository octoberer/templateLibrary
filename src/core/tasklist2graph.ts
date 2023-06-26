import LogicFlow from '@logicflow/core';
import { basicTaskDefine, templateConnectTaskObjDefine, templateDefine, templateTaskDefine } from '../define';
import { getTaskByKey } from '../tools/genTypeObj';
import { genGroupFromNodes, getTaskKeyByTemplate, instanceTemplateTask, padding } from './tools';
export function tasklist2graph(template: templateDefine, LFinstance: LogicFlow) {
    const templateInstance = instanceTemplateTask(template);
    const { memoChildren } = template;
    const memoNodeId2taskKey = {};
    const childrenIds: string[] = [];

    const Position = { left: 0, right: 0, top: 0, bottom: 0 };
    const { handle } = template;
    const { x: initialX, y: initialY } = getTaskByKey(handle[0]);
    (Position.left = initialX), (Position.right = initialX);
    (Position.top = initialY), (Position.bottom = initialY);

    memoChildren.forEach((childkey) => {
        const taskobj = getTaskByKey(childkey);
        const { handleType } = taskobj;
        if (handleType === 'templateGroup') {
            const groupNode = genGroupNode(taskobj, LFinstance, memoNodeId2taskKey, Position);
            childrenIds.push(groupNode.id);
        } else {
            const node = genBasicNode(taskobj, LFinstance, memoNodeId2taskKey, Position);
            childrenIds.push(node.id);
        }
    });
    genGroupFromNodes(templateInstance, childrenIds, LFinstance, Position, true);
    // 加边,遍历孩子节点的所有outputask,生成边
    genGroupEdgs(templateInstance, LFinstance, memoNodeId2taskKey);
}
function genBasicNode(
    taskobj: basicTaskDefine,
    LFinstance: LogicFlow,
    memoNodeId2taskKey: { [x: string]: string },
    Position: { left: any; right: any; top: any; bottom: any },
    currentGroupInstanceId?: string | undefined
) {
    const node = LFinstance.addNode({
        type: taskobj.handleType,
        x: taskobj.x || 0,
        y: taskobj.y || 0,
        properties: {
            ...taskobj,
        },
    });

    let temp1 = taskobj.x || 0;
    let temp2 = taskobj.y || 0;
    Position.left = Position.left > temp1 ? temp1 : Position.left;
    Position.right = Position.right < temp1 ? temp1 : Position.right;
    Position.top = Position.top > temp2 ? temp2 : Position.top;
    Position.bottom = Position.bottom < temp2 ? temp2 : Position.bottom;

    if (currentGroupInstanceId) {
        memoNodeId2taskKey[currentGroupInstanceId + ':' + getTaskKeyByTemplate(taskobj)] = node.id;
    } else {
        memoNodeId2taskKey[getTaskKeyByTemplate(taskobj)] = node.id;
    }
    return node;
}
function genGroupNode(
    taskobj: templateTaskDefine,
    LFinstance: LogicFlow,
    memoNodeId2taskKey: { [x: string]: string },
    Position: { left: any; right: any; top: any; bottom: any }
) {
    let templateOntology = getTaskByKey(taskobj.id);
    const { memoChildren } = templateOntology;
    const childrenIds: string[] = [];

    const currentPosition = { left: 0, right: 0, top: 0, bottom: 0 };
    const { handle } = getTaskByKey(taskobj.id);
    const { x: initialX, y: initialY } = getTaskByKey(handle[0]);
    (currentPosition.left = initialX), (currentPosition.right = initialX);
    (currentPosition.top = initialY), (currentPosition.bottom = initialY);

    memoChildren.forEach((childkey: string | number) => {
        const childtaskObj = getTaskByKey(childkey).id;
        const ontology = getTaskByKey(childtaskObj.id);
        const { handleType } = ontology;
        if (handleType === 'templateGroup') {
            const groupNode = genGroupNode(childtaskObj, LFinstance, memoNodeId2taskKey, currentPosition);
            childrenIds.push(groupNode.id);
        } else {
            const node = genBasicNode(childtaskObj, LFinstance, memoNodeId2taskKey, currentPosition, getTaskKeyByTemplate(taskobj));
            childrenIds.push(node.id);
        }
    });
    // 生成组
    const groupNode = genGroupFromNodes(taskobj, childrenIds, LFinstance, currentPosition, true);

    Position.left = Position.left > currentPosition.left ? currentPosition.left - padding : Position.left;
    Position.right = Position.right < currentPosition.right ? currentPosition.right : Position.right;
    Position.top = Position.top > currentPosition.top ? currentPosition.top - padding : Position.top;
    Position.bottom = Position.bottom < currentPosition.bottom ? currentPosition.bottom : Position.bottom;

    memoNodeId2taskKey[getTaskKeyByTemplate(taskobj)] = groupNode.id;
    return groupNode;
}
function genGroupEdgs(templateTask: templateTaskDefine, LFinstance: LogicFlow, memoNodeId2taskKey: { [x: string]: any }) {
    const templateOntology = getTaskByKey(templateTask.id);
    const { handle } = templateOntology;
    handle.forEach((taskKey: string ) => {
        const taskobj = getTaskByKey(taskKey);
        const ontology = getTaskByKey(taskobj.id);
        debugger;
        if (ontology && ontology.handleType === 'templateGroup') {
            // 解决组内的边
            genGroupEdgs(taskobj, LFinstance, memoNodeId2taskKey);
        } else {
            handleStart(taskKey, memoNodeId2taskKey, LFinstance);
        }
    });
}
function handleStart(taskKey: string | number, memoNodeId2taskKey: { [x: string]: any }, LFinstance: LogicFlow) {
    const taskobj = getTaskByKey(taskKey);
    const { outputTaskKeys } = taskobj;
    if (outputTaskKeys.length === 0) return;
    for (const outputTaskKey of outputTaskKeys) {
        const { targetId, targetRelation, sourceRelations, sourceId } = outputTaskKey as templateConnectTaskObjDefine;
        const targetTaskObj = getTaskByKey(targetId);
        const sourceTaskObj = getTaskByKey(sourceId);

        const targetNodeId = memoNodeId2taskKey[[...targetRelation, targetTaskObj.id, targetTaskObj.instanceId].join('_')];
        const sourceNodeId = memoNodeId2taskKey[[...sourceRelations, sourceTaskObj.id, sourceTaskObj.instanceId].join('_')];
        debugger;
        LFinstance.addEdge({
            sourceNodeId,
            targetNodeId,
        });
        handleStart(targetId, memoNodeId2taskKey, LFinstance);
    }
}
