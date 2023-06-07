type listType = {
    [key: string]: (index: number) => void;
};
interface BusType {
    list: listType;
    subscribe: (fnName: string, callback: (index: number) => void) => void;
    emit: (fnName: string, index: number) => void;
}
export const Bus: BusType = {
    list: {},
    subscribe(fnName: string, callback: (index: number) => void) {
        this.list[fnName] = callback;
    },
    emit(fnName: string, index: number) {
        this.list[fnName] && this.list[fnName].call(null,index);
    },
};