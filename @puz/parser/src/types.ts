export type Puz = {
    width: number,
    height: number,
    isScrambled: boolean,
    numClues: number,
    solution: (string | null)[],
    state: (string | null)[],
    clueNumbers: (number | null)[],
    clues: {
        across: Record<number, string>
        down: Record<number, string>
    }
    title?: string,
    author?: string,
    copyright?: string,
    notes?: string,
}

export type PuzMetadata = {
    checksum: number;
    cibChecksum: number;
    version: string;
    width: number;
    height: number;
    numClues: number;
    isScrambled: boolean;
    gridSolutionOffset: number;
    gridStateOffset: number;
    stringsOffset: number;
};

export type FileComponent = {
    offset: number;
    length: number;
    type: 'short' | 'string' | 'byte';
}