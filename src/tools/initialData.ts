//包括了basicTask,processControlTask,template的 id,instanceid的初始化，增加，获取等方法，并将其值同步到local storage

import { basicTaskDefine, templateTaskDefine } from '../define';

const initialTaskObj = () => {
    if (!localStorage.getItem('initialTaskId')) {
        localStorage.setItem('initialTaskId', '0');
    }
    let TaskId = localStorage.getItem('initialTaskId') as string;
    const addAndgetTaskId = () => {
        TaskId = parseInt(TaskId) + 1 + '';
        localStorage.setItem('initialTaskId', TaskId);
        return TaskId;
    };
    if (!localStorage.getItem('initialTaskObj')) {
        localStorage.setItem('initialTaskObj', JSON.stringify({}));
    }
    let str = localStorage.getItem('initialTaskObj') as string;
    let TaskObj = JSON.parse(str);
    const getBasicTaskId = () => {
        return TaskId;
    };
    const addandGetTaskinstanceId = (id: string) => {
        if (TaskObj[id] != undefined) {
            TaskObj[id]++;
        } else {
            TaskObj[id] = 1;
        }
        localStorage.setItem('initialTaskObj', JSON.stringify(TaskObj));
        return TaskObj[id];
    };
    const getTaskinstanceId = (id: string) => {
        return TaskObj[id];
    };
    return {
        addAndgetTaskId,
        getBasicTaskId,
        addandGetTaskinstanceId,
        getTaskinstanceId,
    };
};
export const { addAndgetTaskId, getBasicTaskId, addandGetTaskinstanceId, getTaskinstanceId } = initialTaskObj();
const initialTemplateObj = () => {
    if (!localStorage.getItem('initialTemplateId')) {
        localStorage.setItem('initialTemplateId', '1010');
    }
    let initialTemplateId = localStorage.getItem('initialTemplateId') || '1010';
    const addAndgetTemplateId = () => {
        const temp = parseInt(initialTemplateId) + 1 + '';
        initialTemplateId = temp;
        localStorage.setItem('initialTemplateId', initialTemplateId);
        return initialTemplateId;
    };

    if (!localStorage.getItem('initialTemplateInstanceIdobj')) {
        localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify({}));
    }
    let str = localStorage.getItem('initialTemplateInstanceIdobj') as string;
    let TemplateInstanceIdobj = JSON.parse(str);

    const addandGetTemplateInstance = (id: string) => {
        if (TemplateInstanceIdobj[id] != undefined) {
            TemplateInstanceIdobj[id]++;
        } else {
            TemplateInstanceIdobj[id] = 1;
        }
        localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify(TemplateInstanceIdobj));
        return TemplateInstanceIdobj[id];
    };
    const getTemplateInstanceId = (id: string | number) => {
        return TemplateInstanceIdobj[id];
    };
    return {
        addAndgetTemplateId,
        getTemplateInstanceId,
        addandGetTemplateInstance,
    };
};
export const { addAndgetTemplateId, getTemplateInstanceId, addandGetTemplateInstance } = initialTemplateObj();

const initialProcessControlObj = () => {
    if (!localStorage.getItem('ProcessControlId')) {
        localStorage.setItem('ProcessControlId', '100');
    }
    const id = localStorage.getItem('ProcessControlId') as string;
    let ProcessControlId = JSON.parse(id);
    if (!localStorage.getItem('initialProcessControlObj')) {
        localStorage.setItem('initialProcessControlObj', JSON.stringify({}));
    }
    const str = localStorage.getItem('initialProcessControlObj') as string;
    const ProcessControlObj = JSON.parse(str);

    const addAndgetProcessControlId = () => {
        ProcessControlId = parseInt(ProcessControlId) + 1 + '';
        localStorage.setItem('ProcessControlId', ProcessControlId);
        return ProcessControlId;
    };
    const addProcessControlObj = (id: number) => {
        if (ProcessControlObj[id] != undefined) {
            ProcessControlObj[id]++;
        } else {
            ProcessControlObj[id] = 1;
        }
        localStorage.setItem('initialProcessControlObj', JSON.stringify(ProcessControlObj));
        return ProcessControlObj[id];
    };
    const getProcessControlInstanceId = (id: string | number) => {
        return ProcessControlObj[id];
    };
    return {
        getProcessControlInstanceId,
        addAndgetProcessControlId,
        addProcessControlObj,
    };
};
export const { addAndgetProcessControlId, addProcessControlObj } = initialProcessControlObj();

const initialTaskList = () => {
    if (!localStorage.getItem('allTaskList')) {
        localStorage.setItem('allTaskList', JSON.stringify({}));
    }
    let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || JSON.stringify({}));
    const addTaskList = (res: { [id: string]:   basicTaskDefine | templateTaskDefine }) => {
        allTaskList = { ...allTaskList, ...res };
        localStorage.setItem('allTaskList', JSON.stringify(allTaskList));
    };
    const getTaskByKey = (key: string | number) => {
        if (allTaskList) return allTaskList[key];
    };
    const getAllTaskList = () => {
        if (allTaskList) return allTaskList;
    };
    const updateTaskByKey = (key: string | number, newTask: {[id: string]:any}) => {
        allTaskList[key] = { ...allTaskList[key], ...newTask };
        localStorage.setItem('allTaskList', JSON.stringify(allTaskList));
    };
    return {
        addTaskList,
        getTaskByKey,
        updateTaskByKey,
        getAllTaskList,
    };
};
export const { addTaskList, getTaskByKey, getAllTaskList, updateTaskByKey } = initialTaskList();