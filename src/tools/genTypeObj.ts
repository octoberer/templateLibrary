import { basicTaskDefine, template, templateTaskDefine } from '../define';
import { initialRes } from './transformData/initialData';

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
    let obj = {
        '86': 1,
        '87': 1,
        '88': 1,
        '100': 1,
    };
    obj = {};
    if (!localStorage.getItem('initialTaskObj')) {
        localStorage.setItem('initialTaskObj', JSON.stringify(obj));
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
    let obj = {
        '86': {
            id: 86,
            handleType: 'task',
            inputArgs: [],
            outputArgs: [],
        },
        '87': {
            id: 87,
            handleType: 'task',
            inputArgs: [],
            outputArgs: [],
        },
        '88': {
            id: 88,
            handleType: 'task',
            inputArgs: [],
            outputArgs: [],
        },
        '100': {
            id: '100',
            handleType: 'processControlWaitAll',
            handle: 'processControlWaitAll',
        },
        '1006': {
            id: '1006',
            doc: 'test',
            briefName: 'llll',
            handleType: 'templateGroup',
            handle: [86, 87],
            statusId: '',
            status: '',
            memoChildren: ['86_1', '87_1', '88_1', '100_1'],
        },
        '86_1': {
            id: 86,
            instanceId: 1,
            parId: '1006',
            inputTaskKeys: [],
            outputTaskKeys: [
                {
                    source: '86_1',
                    target: '100_1',
                    sourcerelations: ['1006'],
                    targetrelations: ['1006'],
                },
            ],
        },
        '87_1': {
            id: 87,
            instanceId: 1,
            parId: '1006',
            inputTaskKeys: [],
            outputTaskKeys: [
                {
                    source: '87_1',
                    target: '100_1',
                    sourcerelations: ['1006'],
                    targetrelations: ['1006'],
                },
            ],
        },
        '88_1': {
            id: 88,
            instanceId: 1,
            parId: '1006',
            inputTaskKeys: [
                {
                    source: '87_1',
                    target: '100_1',
                    sourcerelations: ['1006'],
                    targetrelations: ['1006'],
                },
                {
                    source: '100_1',
                    target: '88_1',
                    sourcerelations: ['1006'],
                    targetrelations: ['1006'],
                },
            ],
            outputTaskKeys: [],
        },
        '100_1': {
            id: '100',
            instanceId: 1,
            parId: '1006',
            inputTaskKeys: [
                {
                    source: '87_1',
                    target: '100_1',
                    sourcerelations: ['1006'],
                    targetrelations: ['1006'],
                },
            ],
            outputTaskKeys: [
                {
                    source: '100_1',
                    target: '88_1',
                    sourcerelations: ['1006'],
                    targetrelations: ['1006'],
                },
            ],
        },
    };
    obj = {};
    if (!localStorage.getItem('allTaskList')) {
        localStorage.setItem('allTaskList', JSON.stringify(obj));
    }

    let allTaskList = JSON.parse(localStorage.getItem('allTaskList') || JSON.stringify(obj));
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
