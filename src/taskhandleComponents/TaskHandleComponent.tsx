import React, { Fragment } from 'react';
import TwoparamsFouroperations from './twoparamsFouroperations';
import OneparamsFouroperations from './OneparamsFouroperations';

export default function TaskHandleComponent({
    selectmethod,
    inputparams,
    outputparams,
}: {
    selectmethod: any;
    inputparams: string[];
    outputparams: string[];
}) {
    const convertToSymbol = (selectmethod: any) => {
        switch (selectmethod) {
            case 'add':
                return '➕';
            case 'sub':
                return '➖';
            case 'multipy':
                return '✖';
            case 'divide':
                return '➗';
            case 'modular':
                return '%';
            case 'power':
                return '^';
            case 'extractAroot':
                return '开根';
            case 'Equalto':
                return '==';
            case 'outweight':
                return '＞';
            case 'less':
                return '＜';
            case 'atLeast':
                return '≥';
            case 'atMost':
                return '≤';
            case 'notEqualto':
                return '≠';
            default:
                return '➕';
        }
    };
    return (
        <div style={{ marginBottom: '20px' }}>
            {['add', 'sub', 'multipy', 'divide', 'Equalto', 'outweight', 'less', 'atLeast', 'atMost', 'notEqualto'].indexOf(selectmethod) !=
                -1 && (
                <TwoparamsFouroperations
                    inputparams={inputparams}
                    outputparams={outputparams}
                    operation={convertToSymbol(selectmethod)}
                ></TwoparamsFouroperations>
            )}
            {['modular', 'power', 'extractAroot'].indexOf(selectmethod) != -1 && (
                <OneparamsFouroperations
                    inputparams={inputparams}
                    outputparams={outputparams}
                    operation={convertToSymbol(selectmethod)}
                ></OneparamsFouroperations>
            )}
        </div>
    );
}
