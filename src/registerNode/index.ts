// 注册logicflow组件的方法，以下分别提供了注册task,ProcessControlwaitAll,ProcessControlwaitAny,Start,End,Group等方法
// 与此对应的是在页面左边栏的组件，拖拽可触发生成某type的组件，其实质是经过定义的view，model基类实例化生成的一个组件
import getregisterEndobj from './registerEnd';
import getregisterProcessControlWaitAllobj from './registerProcessControlwaitAll';
import getregisterProcessControlWaitAnyobj from './registerProcessControlwaitAny';
import getregisterStartobj from './registerStart';
import getregisterTaskobj from './registerTask';
import getregisterTemplateGroupObj from './registerTemplateGroup';

export {
    getregisterEndobj,
    getregisterStartobj,
    getregisterProcessControlWaitAllobj,
    getregisterProcessControlWaitAnyobj,
    getregisterTaskobj,
    getregisterTemplateGroupObj
};
