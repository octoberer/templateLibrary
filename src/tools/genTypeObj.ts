import {
  basicTaskDefine,
  template,
  templateTaskDefine,
} from '../define';
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
  // obj = {};
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
export const {
  addAndgetTaskId,
  getBasicTaskId,
  addandGetTaskinstanceId,
  getTaskinstanceId,
} = initialTaskObj();

export const getcomponentArgObj = ({
  paramsName,
  uiComponent,
  isFixedValue,
  value,
}) => {
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
    localStorage.setItem('initialTemplateId', '1005');
  }
  let initialTemplateId =
    localStorage.getItem('initialTemplateId') || '1005';

  if (!localStorage.getItem('initialTemplateInstanceIdobj')) {
    localStorage.setItem(
      'initialTemplateInstanceIdobj',
      JSON.stringify({ '1000': '1' })
    );
  }
  let str = localStorage.getItem(
    'initialTemplateInstanceIdobj'
  ) as string;
  let TemplateInstanceIdobj = JSON.parse(str);

  const addAndgetTemplateId = () => {
    const temp = parseInt(initialTemplateId) + 1 + '';
    initialTemplateId = temp;
    localStorage.setItem('initialTemplateId', initialTemplateId);
    return initialTemplateId;
  };
  const addTemplateInstance = (id: string) => {
    if (TemplateInstanceIdobj[id] != undefined) {
      TemplateInstanceIdobj[id] = TemplateInstanceIdobj[id]++;
    } else {
      TemplateInstanceIdobj[id] = 1;
    }
    localStorage.setItem(
      'initialTemplateInstanceIdobj',
      JSON.stringify(TemplateInstanceIdobj)
    );
    return TemplateInstanceIdobj[id];
  };
  const getTemplateInstanceId = (id: string | number) => {
    return TemplateInstanceIdobj[id];
  };
  if (!localStorage.getItem('TemplateTaskInstanceIdobj')) {
    localStorage.setItem(
      'TemplateTaskInstanceIdobj',
      JSON.stringify({ '1000': { '1': '1' } })
    );
  }
  const TemplateTaskInstanceIdobjstr = localStorage.getItem(
    'TemplateTaskInstanceIdobj'
  ) as string;
  const TemplateTaskInstanceIdobj = JSON.parse(
    TemplateTaskInstanceIdobjstr
  );
  const addandGettemplateTaskinstanceId = (
    id: string | number,
    instanceId: string | number
  ) => {
    if (
      TemplateTaskInstanceIdobj[id] &&
      TemplateTaskInstanceIdobj[id][instanceId] != undefined
    ) {
      TemplateTaskInstanceIdobj[id][instanceId] =
        TemplateTaskInstanceIdobj[id][instanceId]++;
    } else {
      TemplateTaskInstanceIdobj[id][instanceId] = 1;
    }
    localStorage.setItem(
      'initialTemplateTaskInstanceIdobj',
      JSON.stringify(TemplateTaskInstanceIdobj)
    );
    return TemplateTaskInstanceIdobj[id][instanceId];
  };
  return {
    addAndgetTemplateId,
    getTemplateInstanceId,
    addTemplateInstance,
    addandGettemplateTaskinstanceId,
  };
};
export const {
  addAndgetTemplateId,
  getTemplateInstanceId,
  addTemplateInstance,
  addandGettemplateTaskinstanceId,
} = initialTemplateObj();

const initialProcessControlObj = () => {
  if (!localStorage.getItem('ProcessControlId')) {
    localStorage.setItem('ProcessControlId', '100');
  }
  const id = localStorage.getItem('ProcessControlId') as string;
  let ProcessControlId = JSON.parse(id);
  if (!localStorage.getItem('initialProcessControlObj')) {
    localStorage.setItem(
      'initialProcessControlObj',
      JSON.stringify({})
    );
  }
  const str = localStorage.getItem(
    'initialProcessControlObj'
  ) as string;
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
    localStorage.setItem(
      'initialProcessControlObj',
      JSON.stringify(ProcessControlObj)
    );
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
export const { addAndgetProcessControlId, addProcessControlObj } =
  initialProcessControlObj();

const initialTaskList = () => {
  let obj = {
    '86': {
      id: 86,
      outputTaskKeys: [],
      inputTaskKeys: [],
      handleType: 'task',
      inputArgs: [],
      outputArgs: [],
    },
    '87': {
      id: 87,
      outputTaskKeys: [],
      inputTaskKeys: [],
      handleType: 'task',
      inputArgs: [],
      outputArgs: [],
    },
    '88': {
      id: 88,
      outputTaskKeys: [],
      inputTaskKeys: [],
      handleType: 'task',
      inputArgs: [],
      outputArgs: [],
      outputTask: [],
    },
    '100': {
      id: '100',
      handleType: 'processControlWaitAll',
      handle: 'processControlWaitAll',
      outputTaskKeys: [],
      inputTaskKeys: [],
      inputArgs: [],
      outputArgs: [],
    },
    '1004': {
      id: '1004',
      doc: 'test',
      briefName: 'llll',
      handleType: 'templateGroup',
      handle: [86, 87],
      statusId: '',
      status: '',
      memoChildren: ['100_1', '86_1', '88_1', '87_1'],
    },
    '100_1': {
      id: '100',
      instanceId: 1,
      parId: '1004',
      inputTaskKeys: ['86_1', '87_1'],
      outputTaskKeys: ['88_1'],
    },
    '86_1': {
      id: 86,
      instanceId: 1,
      parId: '1004',
      inputTaskKeys: [],
      outputTaskKeys: ['100_1'],
    },
    '88_1': {
      id: 88,
      instanceId: 1,
      parId: '1004',
      inputTaskKeys: ['100_1'],
      outputTaskKeys: [],
    },
    '87_1': {
      id: 87,
      instanceId: 1,
      parId: '1004',
      inputTaskKeys: [],
      outputTaskKeys: ['100_1'],
    },
  };
  // obj = {};
  if (!localStorage.getItem('allTaskList')) {
    localStorage.setItem('allTaskList', JSON.stringify(obj));
  }

  let allTaskList = JSON.parse(
    localStorage.getItem('allTaskList') || JSON.stringify(obj)
  );
  const resettingTaskList = () => {
    for (let key in allTaskList) {
      allTaskList[key].gen = false;
    }
  };
  resettingTaskList();
  // addTemplatestructure记录所有模板的所有信息
  const addTaskList = (res: {
    [id: string]: template | basicTaskDefine | templateTaskDefine;
  }) => {
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
export const {
  addTaskList,
  getTaskListByID,
  getAllTaskList,
  resettingTaskList,
} = initialTaskList();
