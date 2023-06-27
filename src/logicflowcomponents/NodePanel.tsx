import { addAndgetProcessControlId, addAndgetTaskId, addAndgetTemplateId, addProcessControlObj, addandGetTaskinstanceId, getTemplateInstanceId } from '../tools/initialData';
import styles from './Nodepanel.module.css';
import LogicFlow from '@logicflow/core';

interface nodeType {
    style: string;
    text: string;
    type: string;
}
interface nodeListType {
    nodeList: nodeType[];
    LFinstanceobj: LogicFlow | null;
}
// 左侧节点栏
export default function NodePanel({ nodeList, LFinstanceobj }: nodeListType) {
    const dragNode = (item: nodeType) => {
        if (!LFinstanceobj) return;
        if (item.type == 'selectArea') {
            LFinstanceobj.extension.selectionSelect.openSelectionSelect();
            return;
        }
        else if (item.type == 'processControlWaitAny' || item.type == 'processControlWaitAll') {
            let id=addAndgetProcessControlId()
            let instanceId=addProcessControlObj(id)

            LFinstanceobj.dnd.startDrag({
                type: item.type,
                properties: {
                    id: id+'',
                    instanceId,
                    handleType: item.type,
                    handle: item.type,
                    outputTaskKeys:[],
                    inputTaskKeys:[]
                },
            });
        }
        else if (item.type == 'task') {
            let id=addAndgetTaskId() + '';
            let instanceId=addandGetTaskinstanceId(id)
            LFinstanceobj.dnd.startDrag({
                type: item.type,
                properties: {
                    id,
                    instanceId,
                    handleType: 'task',
                    outputTaskKeys:[],
                    inputTaskKeys:[]
                },
            });
        }
        else if(item.type =='templateGroup') {
            let id=addAndgetTemplateId()
            LFinstanceobj.dnd.startDrag({
                type: item.type,
                properties: {
                    id,
                    instanceId: getTemplateInstanceId(id),
                    handleType: 'template',
                    handle: item.type,
                },
            });
        }
        else {
            LFinstanceobj.dnd.startDrag({
                type: item.type,
            });
        }
    };
    return (
        <>
            {nodeList.map((item: nodeType, index) => (
                <div onMouseDown={() => dragNode(item)} className={styles.itemwrapper} key={index}>
                    <div className={styles[item.style] + ' ' + styles['node-item-icon']}></div>
                    <span>{item.text}</span>
                </div>
            ))}
        </>
    );
}
