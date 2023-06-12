import TwoparamsFouroperations from './Operation_twoparams';
import styles from './TaskHandleComponent.module.css';
import OneparamsOperations from './Operation_Oneparams';
import MultipleParamsOperation from './Operation_multipleParams';
export default function TaskHandleComponent({
    selectmethod,
    inputparamNames,
    outputparamNames,
    getHandleData
}: {
    selectmethod: any;
    inputparamNames: string[];
    outputparamNames: string[];
    getHandleData: (data:any) => void
}) {
    
    return (
        <div className={styles.wrapper}>
            {['add', 'sub', 'multipy', 'divide', 'Equalto', 'outweight', 'less', 'atLeast', 'atMost', 'notEqualto'].indexOf(selectmethod) !=
                -1 && (
                <TwoparamsFouroperations
                    getHandleData={getHandleData}
                    inputparams={inputparamNames}
                    outputparams={outputparamNames}
                    selectmethod={selectmethod}
                ></TwoparamsFouroperations>
            )}
            {['modular', 'power', 'extractAroot'].indexOf(selectmethod) != -1 && (
                <OneparamsOperations
                    getHandleData={getHandleData}
                    inputparams={inputparamNames}
                    outputparams={outputparamNames}
                    selectmethod={selectmethod}
                ></OneparamsOperations>
            )}
            {['median', 'min', 'max','Averaging','sum'].indexOf(selectmethod) != -1 && (
                <MultipleParamsOperation
                    getHandleData={getHandleData}
                    inputparams={inputparamNames}
                    outputparams={outputparamNames}
                    selectmethod={selectmethod}
                ></MultipleParamsOperation>
            )}
        </div>
    );
}
