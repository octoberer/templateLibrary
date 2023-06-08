import { RectNode, RectNodeModel } from '@logicflow/core';

export default function getregisterStartobj() {
    class StartView extends RectNode {}

    class StartModel extends RectNodeModel {
        initNodeData(data: any) {
            super.initNodeData(data);
            this.width = 150;
            this.height = 60;
            this.radius = 50;
            this.text.draggable = false;
            this.text.editable = false;
            this.text.value = 'start';
        }
    }
    return {
        type: 'start',
        view: StartView,
        model: StartModel,
    };
}
