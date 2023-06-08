import TwoparamsFouroperations from './twoparamsFouroperations';
import OneparamsFouroperations from './OneparamsFouroperations';
import styles from './TaskHandleComponent.module.css';
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
                <OneparamsFouroperations
                    getHandleData={getHandleData}
                    inputparams={inputparamNames}
                    outputparams={outputparamNames}
                    selectmethod={selectmethod}
                ></OneparamsFouroperations>
            )}
        </div>
    );
}
