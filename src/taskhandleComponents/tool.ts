export const convertToSymbol = (selectmethod: any) => {
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
            return '⨅';
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
        case 'median':
            return 'Me';
        case 'min':
            return 'min';
        case 'max':
            return 'max';
        case 'Averaging':
            return '⨂';
        case 'sum':
            return '∑';
        default:
            return '➕';
    }
};