import LogicFlow from '@logicflow/core';
import { basicTaskDefine, templateConnectTaskObjDefine, templateDefine, templateTaskDefine } from '../define';
import {
    getTaskKeyByTemplate,
    getTopNode,
    instanceTemplateTask,
    isTemplateGroup,
    padding,
    taskHeight,
    taskWidth,
} from './tools';
import { getTaskByKey } from '../tools/initialData';
export function tasklist2graph(template: templateDefine, LFinstance: LogicFlow) {
    // 首先，将孩子按计算出来的位置和任务属性值进行相应生成，此后生成其父group，依次递归。
    // 然后，按照每个任务的outputTaskKeys生成边,遍历组的所有孩子，生成组内部的连接。一个组的边生成后，再通过组的outputTaskKeys进行组外边的生成，依次递归。
    // 利用memoNodeId2taskKey记录taskkey和node实际id的对应关系，(因为这个原因，这里要保证每个模板内部不能出现相同key的任务,后续可通过加上task的relation进行区分)
    const templateInstance = instanceTemplateTask(template);
    const { memoChildren } = template;
    const memoNodeId2taskKey = {};
    const childrenIds: string[] = [];
    let startNodePostion = {
        x: 0,
        y: 0,
    };
    const Position = {
        left: startNodePostion.x,
        right: startNodePostion.x,
        top: startNodePostion.y,
        bottom: startNodePostion.y,
    };
    // Position记录当前组最新的最左，最右，最上，最下的位置
    // startNodePostion记录当前组的handle[0]的实际坐标位置
    const PositionObj = { Position, startNodePostion };
    memoChildren.forEach((childkey) => {
        const taskobj = getTaskByKey(childkey);
        const ontology = getTaskByKey(taskobj.id);
        if (ontology && ontology.handleType === 'templateGroup') {
            const groupNode = genGroupNode(taskobj, LFinstance, memoNodeId2taskKey, PositionObj);
            childrenIds.push(groupNode.id);
        } else {
            const node = genBasicNode(taskobj, LFinstance, memoNodeId2taskKey, PositionObj);
            childrenIds.push(node.id);
        }
    });
    genGroupFromNodes(templateInstance, childrenIds, LFinstance, Position, true);
    genGroupEdgs(templateInstance, LFinstance, memoNodeId2taskKey);
}
function genBasicNode(
    taskobj: basicTaskDefine,
    LFinstance: LogicFlow,
    memoNodeId2taskKey: { [x: string]: string },
    PositionObj: { Position: { left: number; right: number; top: number; bottom: number }; startNodePostion: { x: any; y: any } }
) {
    const { Position, startNodePostion } = PositionObj;
    const node = LFinstance.addNode({
        type: taskobj.handleType,
        x: taskobj.x + startNodePostion.x || 0,
        y: taskobj.y + startNodePostion.y || 0,
        properties: {
            ...taskobj,
        },
    });

    let temp1 = taskobj.x + startNodePostion.x || 0;
    let temp2 = taskobj.y + startNodePostion.y || 0;
    Position.left = Position.left > temp1 ? temp1 : Position.left;
    Position.right = Position.right < temp1 ? temp1 : Position.right;
    Position.top = Position.top > temp2 ? temp2 : Position.top;
    Position.bottom = Position.bottom < temp2 ? temp2 : Position.bottom;
    memoNodeId2taskKey[getTaskKeyByTemplate(taskobj)] = node.id;
    return node;
}
function genGroupNode(
    taskobj: templateTaskDefine,
    LFinstance: LogicFlow,
    memoNodeId2taskKey: { [x: string]: string },
    PositionObj: { Position: any; startNodePostion: any }
) {
    const { Position, startNodePostion } = PositionObj;
    let templateOntology = getTaskByKey(taskobj.id);
    const { memoChildren, handle } = templateOntology;
    const childrenIds: string[] = [];
    taskobj.width = taskobj.width || 800;
    taskobj.height = taskobj.height || 800;
    const template = getTaskByKey(taskobj.id);
    const startKey = getTopNode(template) || handle[0];
    const startTask = getTaskByKey(startKey);
    let currentStartNodePostion = { x: 0, y: 0 };
    startTask.width = startTask.width || taskWidth;
    startTask.height = startTask.height || taskHeight;
    // 纠正组中心和内部孩子节点的坐标差距
    if (isTemplateGroup(startKey)) {
        // 纠正组中心和内部组节点的坐标差距
        currentStartNodePostion = {
            x: taskobj.x + startNodePostion.x - (taskobj.width / 2 - startTask.width / 2 - padding),
            y: taskobj.y + startNodePostion.y- (taskobj.height / 2 - startTask.height / 2 - padding),
        };
    } else {
        // 纠正组中心和内部基础节点的坐标差距
        currentStartNodePostion = {
            x: taskobj.x + startNodePostion.x - (taskobj.width / 2 - taskWidth / 2 - padding),
            y: taskobj.y + startNodePostion.y- (taskobj.height / 2 - taskHeight / 2 - padding),
        };
    }

    const currentPosition = {
        left: currentStartNodePostion.x,
        right: currentStartNodePostion.x,
        top: currentStartNodePostion.y,
        bottom: currentStartNodePostion.y,
    };

    memoChildren.forEach((childkey: string | number) => {
        debugger;
        const childtaskObj = getTaskByKey(childkey);
        const ontology = getTaskByKey(childtaskObj.id);
        if (ontology && ontology.handleType === 'templateGroup') {
            const groupNode = genGroupNode(childtaskObj, LFinstance, memoNodeId2taskKey, {
                Position: currentPosition,
                startNodePostion: currentStartNodePostion,
            });
            childrenIds.push(groupNode.id);
        } else {
            const node = genBasicNode(childtaskObj, LFinstance, memoNodeId2taskKey, {
                Position: currentPosition,
                startNodePostion: currentStartNodePostion,
            });
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
    const { memoChildren } = templateOntology;
    memoChildren.forEach((taskKey: string) => {
        const taskobj = getTaskByKey(taskKey);
        const ontology = getTaskByKey(taskobj.id);
        if (ontology && ontology.handleType === 'templateGroup') {
            genGroupEdgs(taskobj, LFinstance, memoNodeId2taskKey);
            // 解决组外的边
            const { outputTaskKeys } = taskobj;
            for (let outputTaskKey of outputTaskKeys) {
                const { targetId, sourceId } = outputTaskKey as templateConnectTaskObjDefine;
                const targetNodeId = memoNodeId2taskKey[targetId];
                const sourceNodeId = memoNodeId2taskKey[sourceId];
                LFinstance.addEdge({
                    sourceNodeId,
                    targetNodeId,
                });
            }
        } else {
            // 解决组内部
            handleStart(taskKey, memoNodeId2taskKey, LFinstance);
        }
    });
}
function handleStart(taskKey: string | number, memoNodeId2taskKey: { [x: string]: any }, LFinstance: LogicFlow) {
    const taskobj = getTaskByKey(taskKey);
    let { outputTaskKeys } = taskobj;
    for (const outputTaskKey of outputTaskKeys) {
        const { targetId,sourceId } = outputTaskKey as templateConnectTaskObjDefine;
        const targetNodeId = memoNodeId2taskKey[targetId];
        const sourceNodeId = memoNodeId2taskKey[sourceId];
        LFinstance.addEdge({
            sourceNodeId,
            targetNodeId,
        });
    }
}
function genGroupFromNodes(
    properties: basicTaskDefine | templateTaskDefine,
    childrenIds: string[],
    LFinstance: LogicFlow,
    Position: { left: any; right: any; top: any; bottom: any },
    Positionflag: boolean
) {
    debugger
    let groupElem;
    if (Positionflag) {
        const width = Position.right - Position.left + taskWidth + padding * 2;
        const height = Position.bottom - Position.top + taskHeight+ padding * 2;
        const initialX = (Position.right - Position.left) / 2 + Position.left;
        const initialY = (Position.bottom - Position.top) / 2 + Position.top;
        groupElem = {
            type: 'templateGroup',
            x: initialX,
            y: initialY,
            children: childrenIds,
            properties: { ...properties, width, height },
        };
    } else {
        groupElem = {
            type: 'templateGroup',
            x: properties.x,
            y: properties.y,
            children: childrenIds,
            properties,
        };
    }
    const groupNode = LFinstance.addNode(groupElem);
    return groupNode;
}
