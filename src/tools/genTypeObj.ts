import { basicTaskDefine, template, templateTaskDefine } from "../define";
import { initialRes } from "./transformData/initialData";

const initialTaskObj = () => {
    if (!localStorage.getItem('initialTaskId')) {
        localStorage.setItem('initialTaskId', JSON.stringify('0'));
    }
    let id = localStorage.getItem('initialTaskId') as string;
    let TaskId = JSON.parse(id);
    const addAndgetTaskId = () => {
        TaskId = parseInt(TaskId) + 1 + '';
        localStorage.setItem('initialTaskId', JSON.stringify(TaskId));
        return TaskId;
    };
    if (!localStorage.getItem('initialTaskObj')) {
        localStorage.setItem('initialTaskObj', JSON.stringify({}));
    }
    let str = localStorage.getItem('initialTaskObj') as string;
    let TaskObj = JSON.parse(str);
    const getBasicTaskId=()=>{
        return TaskId
    }
    const addTaskinstanceId = (id:string) => {
        if (TaskObj[id] != undefined) {
            TaskObj[id]++;
        } else {
            TaskObj[id] = 1;
        }
        localStorage.setItem('initialTaskIdObj', JSON.stringify(TaskObj));
    };
    const getTaskinstanceId = (id:string) => {
        return TaskObj[id];
    };
    return {addAndgetTaskId, getBasicTaskId, addTaskinstanceId,getTaskinstanceId};
};
export const { addAndgetTaskId, getBasicTaskId, addTaskinstanceId,getTaskinstanceId} = initialTaskObj();

export const getcomponentArgObj = ({ paramsName, uiComponent, isFixedValue, value }) => {
    return {
        label: paramsName,
        name: paramsName,
        type: typeof paramsName,
        doc: '',
        uiComponent,
        value,
        isFixedValue,
        allowEdit: true,
    };
};
export const getTaskIOArg = ({ param, doc }) => {
    return {
        label: param,
        name: param,
        type: typeof param,
        doc,
    };
};
const initialTemplateObj = () => {
    if (!localStorage.getItem('initialTemplateId')) {
        localStorage.setItem('initialTemplateId', '1000');
    }
    let initialTemplateId = localStorage.getItem('initialTemplateId') || '1000';

    if (!localStorage.getItem('initialTemplateInstanceIdobj')) {
        localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify({ '1000': "1" }));
    }
    let str = localStorage.getItem('initialTemplateInstanceIdobj') as string;
    let TemplateInstanceIdobj = JSON.parse(str);

    const addAndgetTemplateId = () => {
        debugger
        initialTemplateId = parseInt(initialTemplateId) + 1 + '';
        localStorage.setItem('initialTemplateId', JSON.stringify(initialTemplateId));
        return initialTemplateId;
    };
    const addTemplateInstance = (id: string) => {
        debugger
        if (TemplateInstanceIdobj[id] != undefined) {
            TemplateInstanceIdobj[id]=TemplateInstanceIdobj[id]++;
        } else {
            TemplateInstanceIdobj[id] = 1;
        }
        localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify(TemplateInstanceIdobj));
    };
    const getTemplateInstanceId = (id: string | number) => {
        return TemplateInstanceIdobj[id];
    };
    return { addAndgetTemplateId, getTemplateInstanceId, addTemplateInstance };
};
export const { addAndgetTemplateId, getTemplateInstanceId, addTemplateInstance } = initialTemplateObj();

const initialProcessControlObj = () => {
    if (!localStorage.getItem('ProcessControlId')) {
        localStorage.setItem('ProcessControlId', JSON.stringify('0'));
    }
    let id = localStorage.getItem('ProcessControlId') as string;
    let ProcessControlId = JSON.parse(id);

    if (!localStorage.getItem('initialProcessControlId')) {
        localStorage.setItem('initialProcessControlId', '100');
    }
    if (!localStorage.getItem('initialProcessControlObj')) {
        localStorage.setItem('initialProcessControlObj', JSON.stringify({}));
    }
    let str = localStorage.getItem('initialProcessControlObj') as string;
    let ProcessControlObj = JSON.parse(str);

    const addAndgetProcessControlId = () => {
        ProcessControlId = parseInt(ProcessControlId) + 1 + '';
        localStorage.setItem('ProcessControlId', JSON.stringify(ProcessControlId));
        return ProcessControlId;
    };
    const addProcessControlObj = (id: number) => {
        if (ProcessControlObj[id] != undefined) {
            ProcessControlObj[id]++;
        } else {
            ProcessControlObj[id] = 1;
        }
        localStorage.setItem('initialProcessControlObj', JSON.stringify(ProcessControlObj));
    };
    const getProcessControlInstanceId = (id: string | number) => {
        return ProcessControlObj[id];
    };
    return { getProcessControlInstanceId,addAndgetProcessControlId, addProcessControlObj };
};
export const { addAndgetProcessControlId, addProcessControlObj } = initialProcessControlObj();

const initialTaskList = () => {
    if (!localStorage.getItem('allTaskList')) {
        localStorage.setItem('allTaskList', JSON.stringify(initialRes));
    }
    let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || '{}');
    const resettingTaskList = () => {
        for (let key in allTaskList) {
            allTaskList[key].gen = false;
        }
    };
    resettingTaskList();
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
        resettingTaskList,
    };
};
export const { addTaskList, getTaskListByID, getAllTaskList, resettingTaskList } = initialTaskList();