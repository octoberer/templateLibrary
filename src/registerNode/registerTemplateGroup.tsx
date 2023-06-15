import { h } from '@logicflow/core';
import { GroupNode } from '@logicflow/extension';
export default function getregisterTemplateGroupObj(lf: LogicFlow) {
    class MyGroup extends GroupNode.view {
        // private getLabelShape() {
        //     const { model } = this.props;
        //     const { x, y, width, height } = model;
        //     const style = model.getNodeStyle();
        //     return h(
        //       "svg",
        //       {
        //         x: x - width / 2 + 50,
        //         y: y - height / 2 +  50,
        //         width: 25,
        //         height: 25,
        //         viewBox: "0 0 1274 1024"
        //       },
        //       h("path", {
        //         fill: style.stroke,
        //         d:
        //           "M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z"
        //       })
        //     );
        //   }
        //   /**
        //    * 完全自定义节点外观方法
        //    */
        //   getShape() {
        //     const { model, graphModel } = this.props;
        //     const { x, y, width, height, radius } = model;
        //     const style = model.getNodeStyle();
        //     return h("g", {}, [
        //       h("rect", {
        //         ...style,
        //         x: x - width / 2,
        //         y: y - height / 2,
        //         rx: radius,
        //         ry: radius,
        //         width,
        //         height
        //       }),
        //       this.getLabelShape()
        //     ]);
        //   }
    }

    class MyGroupModel extends GroupNode.model {
        initNodeData(data) {
            super.initNodeData(data);
            this.foldable = true;
            this.isRestrict = true;
            this.resizable = true;
            this.width = 800;
            this.height = 800;
            this.foldedWidth = 200;
            this.foldedHeight = 200;
            const noTarget = {
                message: '不允许连接分组',
                validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
                    return false;
                },
            };
            // this.targetRules.push(noTarget);
        }
        isAllowAppendIn(nodeData) {
            // 设置只允许custom-rect节点被添加到此分组中
            return nodeData.type === "no";
          }
        getAddableOutlineStyle() {
            const style = super.getAddableOutlineStyle();
            style.stroke = "#AEAFAE";
            style.strokeDasharray = "3 3";
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
