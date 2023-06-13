type listType = {
    [key: string]: any;
};
interface BusType {
    list: listType;
    subscribe: (fnName: string, callback: (param: any) => void) => void;
    emit: (fnName: string, index: number) => void;
}
export const Bus: BusType = {
    list: {},
    subscribe(fnName: string, callback: (index: number) => void) {
        if (this.list[fnName]) {
            this.list[fnName].push(callback);
        }
        else{
            this.list[fnName]=[callback]
        }
    },
    emit(fnName: string, param: any) {
        if (Array.isArray(this.list[fnName])) {
            this.list[fnName].forEach((fn: any) => {
                fn.call(null, param);
            });
        }
    },
};
