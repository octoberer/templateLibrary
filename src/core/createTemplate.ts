import { templateDefine } from "../define";
import { addAndgetTemplateId, addTaskList } from "../tools/initialData";

export function createTemplate({ doc, briefName },{memoChildren,handle}) {
    const id=addAndgetTemplateId();
    const templateobj: templateDefine = {
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
}