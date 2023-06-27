import { GroupNode } from '@logicflow/extension';
import { getTaskKeyByNode } from '../core/tools';
import { BaseNodeModel } from '@logicflow/core';
import { getTaskByKey } from '../tools/initialData';
export default function getregisterTemplateGroupObj() {
    class MyGroup extends GroupNode.view {}

    class MyGroupModel extends GroupNode.model {
        initNodeData(data: any) {
            super.initNodeData(data);
            this.foldable = true;
            this.isRestrict = true;
            this.resizable = true;
            this.width = this.properties.width || 800;
            this.height = this.properties.height || 800;
            this.foldedWidth = 200;
            this.foldedHeight = 200;
            const noTarget = {
                message: '不允许连接分组',
                validate: () => {
                    return false;
                },
            };
            this.targetRules.push(noTarget);
        }
        isAllowAppendIn(node: BaseNodeModel) {
            // 设置只允许本来在该组的节点被添加到此分组中
            let { id } = this.getProperties();
            let templateobj = getTaskByKey(id);
            return templateobj.memoChildren.indexOf(getTaskKeyByNode(node)) > -1;
        }
        getAddableOutlineStyle() {
            const style = super.getAddableOutlineStyle();
            style.stroke = '#AEAFAE';
            style.strokeDasharray = '3 3';
            return style;
        }
        getNodeStyle() {
            const style = super.getNodeStyle();
            style.stroke = '#989891';
            style.strokeWidth = 1;
            style.strokeDasharray = '3 3';
            if (this.isSelected) {
                style.stroke = 'rgb(124, 15, 255)';
            }
            if (this.isFolded) {
                style.fill = '#47C769';
            }
            return style;
        }
        // 隐藏锚点而不是设置锚点数为0
        // 因为分组内部节点与外部节点相连时，
        // 如果折叠分组，需要分组代替内部节点与外部节点相连。
        getAnchorStyle() {
            const style = super.getAnchorStyle();
            style.stroke = 'transparent';
            style.fill = 'none';
            style.hover.stroke = 'transparent';
            return style;
        }
    }

    return {
        type: 'templateGroup',
        model: MyGroupModel,
        view: MyGroup,
    };
}
