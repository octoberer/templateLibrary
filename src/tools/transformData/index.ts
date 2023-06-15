import { getTemplateId, getTemplateInstanceId } from '../genTypeObj';
import { graphRenderData2TaskList } from './graphdata';
import { initialallTemplatedata } from './initialData';
import { selectAreadata2graphRenderData } from './selectAreadata';

const initialTemplatedata = () => {
    if (!localStorage.getItem('allTemplatedata')) {
        localStorage.setItem('allTemplatedata', JSON.stringify(initialallTemplatedata));
    }
    const addTemplatedata = (data: any[], { doc, briefName }: { doc: any; briefName: any }) => {
        debugger;
        let allTemplatedata = JSON.parse(localStorage.getItem('allTemplatedata') || '[]');
        const templatedata = createTemplateObj(data, { doc, briefName });
        if (allTemplatedata) allTemplatedata.push(templatedata);
        localStorage.setItem('allTemplatedata', JSON.stringify(allTemplatedata));
    };
    const getAllTemplatedata = () => {
        return JSON.parse(localStorage.getItem('allTemplatedata') || '{}');
    };
    return { addTemplatedata, getAllTemplatedata };
};
export const { addTemplatedata, getAllTemplatedata } = initialTemplatedata();
const initialTaskList = () => {
    if (!localStorage.getItem('allTaskList')) {
        localStorage.setItem('allTaskList', JSON.stringify({}));
    }
    // addTemplatestructure记录所有模板的所有信息
    const addTaskList = (res: any) => {
        let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || '{}');
        allTaskList = { ...allTaskList, ...res };
        localStorage.setItem('allTaskList', JSON.stringify(allTaskList));
    };
    const getAllTaskList = (id: string | number) => {
        let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || '{}');
        if (allTaskList) return allTaskList[id];
    };
    return {
        addTaskList,
        getAllTaskList,
    };
};
export const { addTaskList, getAllTaskList } = initialTaskList();
export function addParProperty(graphRenderData) {
    debugger;
    let { nodes, edges } = graphRenderData;
    for (let node of nodes) {
        if (node.type === 'templateGroup') {
            [...node.children].forEach((childid) => {
                let childobj = nodes.find((item) => item.id === childid);
                childobj.properties.par = node;
            });
        }
    }
    return { nodes, edges };
}
export function createTemplateObj(NodeData: any, { doc = 'test', briefName = 'llll' }: { doc: any; briefName: any }) {
    debugger;
    let id = getTemplateId();
    let instanceId = getTemplateInstanceId(id);
    let graphRenderData = Array.isArray(NodeData) ? selectAreadata2graphRenderData(NodeData) : NodeData;
    graphRenderData = addParProperty(graphRenderData);
    const {currentTaskList,firstTasks} = graphRenderData2TaskList(graphRenderData); //得到res以id为键的对象
    debugger
    addTaskList(currentTaskList);
    // const firstTasks = Object.values(currentTaskList).filter((item) => item.inputTask?.length === 0||Object.keys(item.inputTask)===0);
    // const endTasks = Object.values(currentTaskList).filter((item) => item.inputTask?.length === 0||Object.keys(item.inputTask)===0);
    // const inputArgs = firstTasks.map((item) => item?.inputArgs||Object.values(item));
    const memoChildren = graphRenderData.nodes.map(
        (node: { properties: { id: any; instanceId: any } }) => `${node.properties.id}_${node.properties.instanceId}`
    );
    const handle: any[] = [];
    firstTasks.forEach((node) => handle.push(`${node.properties.id}_${node.properties.instanceId}`));
    // const outputArgs = endTasks.map((item) => item.outputArgs);
    let templateobj = {
        id,
        instanceId,
        doc,
        briefName,
        graphRenderData,
        componentArg: null, //模板组件的配置参数
        // inputArgs,
        // outputArgs,
        handleType: 'template',
        handle: handle,
        memoChildren,
        inputTask:{},
        outputTask:{}
    };
    return templateobj;
}
