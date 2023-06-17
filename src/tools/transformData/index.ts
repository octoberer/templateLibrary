import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import { addAndgetTemplateId } from '../genTypeObj';
import { graphRenderData2TaskList } from './graphdata';
import { initialRes } from './initialData';
import { selectAreadata2graphRenderData } from './selectAreadata';
import { basicTaskDefine, template, templateTaskDefine } from '../../define';

export const getAllTemplatedata = () => {
    return Object.values(getAllTaskList()).filter((task) => task.handleType == 'templateGroup' && task.instanceId == undefined);
};
const initialTaskList = () => {
    if (!localStorage.getItem('allTaskList')) {
        localStorage.setItem('allTaskList', JSON.stringify(initialRes));
    }
    let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || '{}');
    const updateTaskList = () => {
        for (let key in allTaskList) {
            allTaskList[key].gen = false;
        }
    };
    updateTaskList();
    // addTemplatestructure记录所有模板的所有信息
    const addTaskList = (res: { [id: string]: template | basicTaskDefine | templateTaskDefine }) => {
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
        updateTaskList,
    };
};
export const { addTaskList, getTaskListByID, getAllTaskList, updateTaskList } = initialTaskList();
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
    let id = addAndgetTemplateId();
    let graphRenderData = Array.isArray(NodeData) ? selectAreadata2graphRenderData(NodeData) : NodeData;
    // graphRenderData = addParProperty(graphRenderData);
    const { currentTaskList, firstTasks } = graphRenderData2TaskList({ ...graphRenderData, topTemplateId: id }); //得到res以id为键的对象
    addTaskList(currentTaskList);
    // const firstTasks = Object.values(currentTaskList).filter((item) => item.inputTask?.length === 0||Object.keys(item.inputTask)===0);
    // const endTasks = Object.values(currentTaskList).filter((item) => item.inputTask?.length === 0||Object.keys(item.inputTask)===0);
    // const inputArgs = firstTasks.map((item) => item?.inputArgs||Object.values(item));
    const memoChildren = Object.values(currentTaskList)
        .filter((task) => task.parId === id)
        .map((task) => getUniqueId(task));
    const handle: any[] = [];
    firstTasks.forEach((node: { properties: { id: any; instanceId: any } }) =>
        handle.push(`${node.properties.id}_${node.properties.instanceId}`)
    );
    // const outputArgs = endTasks.map((item) => item.outputArgs);
    let templateobj: template = {
        id,
        doc,
        briefName,
        handleType: 'templateGroup',
        handle: handle,
        statusId: '',
        status: '',
        memoChildren: memoChildren,
    };
    addTaskList({ [id]: templateobj });
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
    updateTaskList();
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
function getUniqueId(task: basicTaskDefine | templateTaskDefine) {
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

    if (startTask.outputTask?.length > 0) {
        outputTasks = startTask.outputTask;
    } else if (ParTask && ParTask.outputTask && Object.keys(ParTask.outputTask).length > 0) {
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
                let temp = { ...ParTask };
                ParTask = null;
                let res = getAllTaskList();
                for (let key in res) {
                    if (Array.isArray(res[key].memoChildren)) {
                        for (let item of res[key].memoChildren) {
                            if (item.split('_')[0] === temp.id) {
                                ParTask = getTaskListByID(res[key].id);
                                break;
                            }
                        }
                    }
                }
            }
        }
    } else if (ParTask) {
        // 如果group没有输出任务
        while (ParTask && !ParTask.gen) {
            let flag = false;
            if (!ParTask.memoChildren) {
                flag = true;
            } else {
                debugger;
                flag = ParTask.memoChildren.every((id: string) => {
                    if (getTaskListByID(id.split('_')[0])?.memoChildren) {
                        return getTaskListByID(id.split('_')[0]).gen;
                    } else {
                        return getTaskListByID(id).gen;
                    }
                });
            }
            if (flag) {
                genGroup(AlreadyNodes, ParTask, LFinstance);
                ParTask.gen = true;
                let temp = { ...ParTask };
                ParTask = null;
                let res = getAllTaskList();
                debugger;
                for (let key in res) {
                    if (Array.isArray(res[key].memoChildren)) {
                        for (let item of res[key].memoChildren) {
                            if (item.split('_')[0] === temp.id) {
                                ParTask = getTaskListByID(res[key].id);
                                break;
                            }
                        }
                    }
                }
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
                if (outputTask.inputTask[id].indexOf(getUniqueId(startTask)) > -1) {
                    tempOutputTasks.push(id);
                }
            }
            generateGraphFromOutputTask(startNode, startTask, tempOutputTasks, LFinstance, AlreadyNodes);
            return
        }
        let outputNewnode: BaseNodeModel | undefined;
        if (!outputTask.gen) {
            outputNewnode = LFinstance.addNode({
                type: outputTask.handleType,
                x,
                y,
                properties: { ...outputTask },
            });
            IncreaseY();
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
    debugger;
    const children = AlreadyNodes.filter((node: BaseNodeModel ) => {
        let parNodeId = node.properties.parId;
        if(!parNodeId){
            let res=getAllTaskList()
            for(let key in res){
                debugger
                if(key!==node.properties.id&&key.split('_')[0]===node.properties.id){
                    return true
                }
            }
        }
        return parNodeId === templateobj.id;
    });
    const childrenIds = children.map((child) => child.id);
    const groupElem = {
        type: 'templateGroup',
        x: groupx,
        y: groupy,
        children: childrenIds,
        properties: { ...templateobj },
    };
    groupx = groupx + x;
    groupy = groupx + x;
    const groupNode = LFinstance.addNode(groupElem);
    LFinstance.render(LFinstance.getGraphData());
    console.log(LFinstance.getGraphData());
    AlreadyNodes.push(groupNode);
}
let groupx = 100,
    groupy = 100;

