
const initialTaskObj = () => {
    const getBasicTaskId = (selectmethod: any) => {
        switch (selectmethod) {
            case 'add':
                return 1;
            case 'sub':
                return 2;
            case 'multipy':
                return 3;
            case 'divide':
                return 4;
            case 'modular':
                return 5;
            case 'power':
                return 6;
            case 'extractAroot':
                return 7;
            case 'Equalto':
                return 8;
            case 'outweight':
                return 9;
            case 'less':
                return 10;
            case 'atLeast':
                return 11;
            case 'atMost':
                return 12;
            case 'notEqualto':
                return 13;
            default:
                return 14;
        }
    };
    if (!localStorage.getItem('initialTaskObj')) {
        localStorage.setItem('initialTaskObj', JSON.stringify({}));
    }
    let str = localStorage.getItem('initialTaskObj') as string;
    let TaskObj = JSON.parse(str);
    const getTaskinstanceId = (selectmethod: string) => {
        const id = getBasicTaskId(selectmethod);
        if (TaskObj[id] != undefined) {
            TaskObj[id]++;
        } else {
            TaskObj[id] = 1;
        }
        localStorage.setItem('initialTaskIdObj', JSON.stringify(TaskObj));
        return TaskObj[id];
    };
    return { getBasicTaskId, getTaskinstanceId};
};
export const { getBasicTaskId, getTaskinstanceId} = initialTaskObj();

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
        localStorage.setItem('initialTemplateInstanceIdobj', JSON.stringify({ 1000: 1 }));
    }
    let str = localStorage.getItem('initialTemplateInstanceIdobj') as string;
    let TemplateInstanceIdobj = JSON.parse(str);

    const addAndgetTemplateId = () => {
        debugger
        initialTemplateId = parseInt(initialTemplateId) + 1 + '';
        localStorage.setItem('initialTemplateId', JSON.stringify(initialTemplateId));
        return initialTemplateId;
    };
    const addTemplateInstance = (id: number) => {
        if (TemplateInstanceIdobj[id] != undefined) {
            TemplateInstanceIdobj[id]++;
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
    if (!localStorage.getItem('initialProcessControlId')) {
        localStorage.setItem('initialProcessControlId', '100');
    }
    if (!localStorage.getItem('initialProcessControlObj')) {
        localStorage.setItem('initialProcessControlObj', JSON.stringify({}));
    }
    let str = localStorage.getItem('initialProcessControlObj') as string;
    let ProcessControlObj = JSON.parse(str);

    const addAndgetProcessControlId = (selectmethod: any) => {
        switch (selectmethod) {
            case 'processControlWaitAll':
                return 100;
            case 'processControlWaitAny':
                return 101;
            default:
                return 100;
        }
    };
    const addProcessControlObj = (id: number) => {
        if (ProcessControlObj[id] != undefined) {
            ProcessControlObj[id]++;
        } else {
            ProcessControlObj[id] = 1;
        }
        localStorage.setItem('initialProcessControlObj', JSON.stringify(ProcessControlObj));
    };
    const getProcessControlObj = (id: string | number) => {
        return ProcessControlObj[id];
    };
    return { addAndgetProcessControlId, getProcessControlObj, addProcessControlObj };
};
export const { addAndgetProcessControlId, getProcessControlObj, addProcessControlObj } = initialProcessControlObj();
