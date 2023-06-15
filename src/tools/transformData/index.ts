import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { getTemplateId, getTemplateInstanceId } from '../genTypeObj';
import { graphRenderData2TaskList } from './graphdata';
import { initialRes } from './initialData';
import { selectAreadata2graphRenderData } from './selectAreadata';
import { basicTaskDefine, template } from '../../define';

export const getAllTemplatedata = () => {
    return Object.values(getAllTaskList()).filter((task) => task.handleType == 'templateGroup');
};
const initialTaskList = () => {
    if (!localStorage.getItem('allTaskList')) {
        localStorage.setItem('allTaskList', JSON.stringify(initialRes));
    }
    let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || '{}');
    for (let key in allTaskList) {
        allTaskList[key].gen = false;
    }
    // addTemplatestructure记录所有模板的所有信息
    const addTaskList = (res: { [id: string]: template | basicTaskDefine }) => {
        allTaskList = { ...allTaskList, ...res };
        localStorage.setItem('allTaskList', JSON.stringify(allTaskList));
    };
    const getTaskListByID = (id: string | number) => {
        if (allTaskList) return allTaskList[id];
    };
    const getAllTaskList = () => {
        if (allTaskList) return allTaskList;
    };
    return {
        addTaskList,
        getTaskListByID,
        getAllTaskList,
    };
};
export const { addTaskList, getTaskListByID, getAllTaskList } = initialTaskList();
export function addParProperty(graphRenderData: { nodes: any; edges: any }) {
    let { nodes, edges } = graphRenderData;
    for (let node of nodes) {
        if (node.type === 'templateGroup') {
            [...node.children].forEach((childid) => {
                let childobj = nodes.find((item: { id: any }) => item.id === childid);
                childobj.properties.par = node;
            });
        }
    }
    return { nodes, edges };
}
export function addTemplatedata(NodeData: any, { doc = 'test', briefName = 'llll' }: { doc: any; briefName: any }) {
    let id = getTemplateId();
    let instanceId = getTemplateInstanceId(parseInt(id));
    let templateUniqueId = `${id}_${instanceId}`;
    let graphRenderData = Array.isArray(NodeData) ? selectAreadata2graphRenderData(NodeData) : NodeData;
    graphRenderData = addParProperty(graphRenderData);
    const { currentTaskList, firstTasks } = graphRenderData2TaskList({ ...graphRenderData, templateUniqueId }); //得到res以id为键的对象
    addTaskList(currentTaskList);
    // const firstTasks = Object.values(currentTaskList).filter((item) => item.inputTask?.length === 0||Object.keys(item.inputTask)===0);
    // const endTasks = Object.values(currentTaskList).filter((item) => item.inputTask?.length === 0||Object.keys(item.inputTask)===0);
    // const inputArgs = firstTasks.map((item) => item?.inputArgs||Object.values(item));
    const memoChildren=Object.values(currentTaskList).filter(task=>task.parId===templateUniqueId).map(task=>getUniqueId(task))
    const handle: any[] = [];
    firstTasks.forEach((node: { properties: { id: any; instanceId: any } }) =>
        handle.push(`${node.properties.id}_${node.properties.instanceId}`)
    );
    // const outputArgs = endTasks.map((item) => item.outputArgs);
    let templateobj: template = {
        id,
        instanceId,
        doc,
        briefName,
        // inputArgs,
        // outputArgs,
        handleType: 'templateGroup',
        handle: handle,
        inputTask: {},
        outputTask: {},
        statusId: '',
        status: '',
        parId: '',
        gen: false,
        memoChildren:memoChildren
    };
    addTaskList({ [templateUniqueId]: templateobj, ...currentTaskList });
    return templateobj;
}
let x = 0,
    y = 0;
function Increasex() {
    x = x + 400;
}
function IncreaseY() {
    y = y + 300;
}
function IncreaseAll() {
    Increasex();
    IncreaseY();
}
export function generateGraph(templateobj: template, LFinstance: LogicFlow) {
    const AlreadyNodes: BaseNodeModel[] = [];
    generateTemplateGraph({ templateobj, LFinstance, AlreadyNodes });
}
function generateTemplateGraph({
    templateobj,
    LFinstance,
    AlreadyNodes,
}: {
    templateobj: template;
    LFinstance: LogicFlow;
    AlreadyNodes: BaseNodeModel[];
}) {
    // 找到模板的开始节点
    const { handle } = templateobj;
    const startTasks: (basicTaskDefine | template)[] = handle.map((id: string | number) => getTaskListByID(id));
    // 生成开始节点
    startTasks.forEach((task: basicTaskDefine | template) => {
        if (task.handleType === 'templateGroup') {
            generateTemplateGraph({ templateobj: task, LFinstance, AlreadyNodes });
        } else if (task.handleType === 'task') {
            generateGraphFromSingleNode(task, LFinstance, AlreadyNodes);
        }
    });
    // genGroup(AlreadyNodes, templateobj, LFinstance);
}
function getUniqueId(task: basicTaskDefine | template) {
    return `${task.id}_${task.instanceId}`;
}
function generateGraphFromSingleNode(startTask: basicTaskDefine, LFinstance: LogicFlow, AlreadyNodes: BaseNodeModel[]) {
    let startNode: BaseNodeModel | undefined;
    if (!startTask.gen) {
        startNode = LFinstance.addNode({
            type: startTask.handleType,
            x,
            y,
            properties: { ...startTask },
        });
        Increasex();
        AlreadyNodes.push(startNode);
        startTask.gen = true;
    } else {
        startNode = AlreadyNodes.filter((node) => `${node.properties.id}_${node.properties.instanceId}` === getUniqueId(startTask))[0];
    }

    let outputTasks: string[] = [];
    let ParTask = getTaskListByID(startTask.parId);
    if (startTask.outputTask.length > 0) {
        outputTasks = startTask.outputTask;
    } else if (Object.keys(getTaskListByID(startTask.parId).outputTask).length > 0) {
        // 如果group有输出任务
        const groupTask = getTaskListByID(startTask.parId);
        const tempOutputTasks = [];
        for (let id in groupTask.outputTask) {
            if (groupTask.outputTask[id] === getUniqueId(startTask)) {
                tempOutputTasks.push(id);
            }
        }
        outputTasks = tempOutputTasks;
        if (!ParTask.gen) {
            const flag = ParTask.memoChildren?.every((id: string | number) => getTaskListByID(id).gen);
            if (flag) {
                genGroup(AlreadyNodes, ParTask, LFinstance);
                ParTask.gen = true;
            }
        }
    } else if (ParTask) {
        // 如果group没有输出任务
        debugger
        while (ParTask&&!ParTask.gen) {
            let flag = false;
            if (!ParTask.memoChildren) {
                flag = true;
            } else {
                flag = ParTask.memoChildren.every((id: string | number) => getTaskListByID(id).gen);
            }
            if (flag) {
                genGroup(AlreadyNodes, ParTask, LFinstance);
                ParTask.gen = true;
                ParTask = getTaskListByID(ParTask.parId);
            } else {
                break;
            }
        }
    }
    generateGraphFromOutputTask(startNode, startTask, outputTasks, LFinstance, AlreadyNodes);
}
function generateGraphFromOutputTask(
    startNode: BaseNodeModel,
    startTask: basicTaskDefine,
    outputTasks: string[],
    LFinstance: LogicFlow,
    AlreadyNodes: BaseNodeModel[]
) {
    outputTasks.forEach((outputTaskId: string) => {
        let outputTask = getTaskListByID(outputTaskId);
        if (outputTask.handleType === 'templateGroup') {
            const tempOutputTasks = [];
            for (let id in outputTask.inputTask) {
                if (outputTask.inputTask[id] === getUniqueId(startTask)) {
                    tempOutputTasks.push(id);
                }
            }
            generateGraphFromOutputTask(startNode, startTask, tempOutputTasks, LFinstance, AlreadyNodes);
        }
        let outputNewnode: BaseNodeModel | undefined;
        if (!outputTask.gen) {
            outputNewnode = LFinstance.addNode({
                type: outputTask.handleType,
                x,
                y,
                properties: { ...outputTask },
            });
            Increasex();
            AlreadyNodes.push(outputNewnode);
            outputTask.gen = true;
        } else {
            outputNewnode = AlreadyNodes.filter((node) => `${node.properties.id}_${node.properties.instanceId}` === outputTaskId)[0];
        }
        // 生成边
        LFinstance.addEdge({
            type: 'polyline',
            sourceNodeId: startNode.id,
            targetNodeId: outputNewnode.id,
        });
        generateGraphFromSingleNode(outputTask, LFinstance, AlreadyNodes);
    });
}
function genGroup(AlreadyNodes: any[], templateobj: template | basicTaskDefine, LFinstance: LogicFlow) {
    debugger
    console.log(LFinstance.getGraphData())
    LFinstance.render(LFinstance.getGraphData());
    console.log(LFinstance.getGraphData())
    const children = AlreadyNodes.filter((node: { properties: { parId: any } }) => {
        const parNodeId = node.properties.parId;
        return parNodeId === getUniqueId(templateobj);
    });
    const childrenIds = children.map((child) => child.id);
    const groupElem = {
        type: 'templateGroup',
        x: x,
        y: y,
        children: childrenIds,
        properties: { ...templateobj },
    };
    Increasex();
    const groupNode = LFinstance.addNode(groupElem);
    LFinstance.render(LFinstance.getGraphData());
    console.log(LFinstance.getGraphData())
    AlreadyNodes.push(groupNode);
}
