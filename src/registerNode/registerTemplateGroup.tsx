import { h } from '@logicflow/core';
import { GroupNode } from '@logicflow/extension';
import ReactDOM from 'react-dom/client';
import TaskUI from '../innerComponents/TaskUI';
export default function getregisterTemplateGroupObj(lf: LogicFlow) {
    class MyGroup extends GroupNode.view {
        // private getEditIcon() {
        //     const { model } = this.props;
        //     if (!model.foldable) return null;
        //     return h('g', {}, [
        //         h(
        //             'rect',
        //             {
        //                 height: 20,
        //                 width: 40,
        //                 rx: 2,
        //                 ry: 2,
        //                 strokeWidth: 1,
        //                 fill: '#F4F5F6',
        //                 stroke: '#CECECE',
        //                 cursor: 'pointer',
        //                 x: model.x - model.width / 2 + 25,
        //                 y: model.y - model.height / 2 + 5,
        //                 onClick: () => {
        //                     console.log('点击了编辑按钮');
        //                 },
        //             },
        //             [h('text', { x: model.x - model.width / 2 + 35, y: model.y - model.height / 2 + 5 }, ['文本内容'])]
        //         ),
        //     ]);
        // }
        // /**
        //  * 完全自定义节点外观方法
        //  */
        // getShape() {
        //     const { model, graphModel } = this.props;
        //     const { x, y, width, height, radius } = model;
        //     const style = model.getNodeStyle();
        //     return h('g', {}, [super.getResizeShape()]);
        // }
    }

    class MyGroupModel extends GroupNode.model {
        initNodeData(data) {
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
                validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
                    return false;
                },
            };
            this.targetRules.push(noTarget);
        }
        isAllowAppendIn(nodeData) {
            // 设置只允许custom-rect节点被添加到此分组中
            let { id, instanceId } = this.getProperties();
            if (!instanceId) {
                return nodeData.properties.parId === `${id}`;
            } else {
                return nodeData.properties.parId === `${id}_${instanceId}`;
            }
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
