import type { FileComponent, Puz, PuzMetadata } from "./types.js";

export function parse(buffer: Uint8Array): Puz {
    // parse header
    const puzzleMetadata = parseHeader(buffer);
    const { 
        numClues,
        width,
        height,
        isScrambled,
        gridSolutionOffset,
        gridStateOffset,
        stringsOffset,
     } = puzzleMetadata;

    // validate checksums

    // parse grid, solution, clues, and rest of data
    const solution = parseGrid(buffer, gridSolutionOffset, width, height);
    const state = parseGrid(buffer, gridStateOffset, width, height);
    const { clues: clueText, ...puzzleText } = parsePuzzleText(buffer, stringsOffset, numClues);

    const clueNumbers = getClueNumbers(solution, width, height);
    const clues = getClues(clueText, clueNumbers, solution, width, height);

    const puz: Puz = {
        width,
        height,
        isScrambled,
        numClues,
        solution,
        state,
        clueNumbers,
        clues,
        ...puzzleText
    }

    return puz
}

function getClues(clueText: string[], clueNumbers: (number | null)[], solution: (string | null)[], width: number, height: number) {
    const clues: Record<'across' | 'down', Record<string, string>> = {
        across: {},
        down: {},
    };

    let matchedClueIndex = 0;
    for (let cluePos = 0; cluePos < clueNumbers.length; cluePos++) {
        const clueNum = clueNumbers[cluePos];
        if (clueNum) {
            if (needsAcrossClue(solution, cluePos, width, height)) {
                clues.across[clueNum] = clueText[matchedClueIndex]!;
                matchedClueIndex++;
            }

            if (needsDownClue(solution, cluePos, width, height)) {
                clues.down[clueNum] = clueText[matchedClueIndex]!;
                matchedClueIndex++
            }
        }
    }

    return clues;
}

function parseHeader(buffer: Uint8Array): PuzMetadata {
    const headerData: Record<string, string | number | undefined> = {};
    for (const [name, component] of Object.entries(PUZ_HEADER_SPEC)) {
        headerData[name] = parseComponent(buffer, component);
    }

    // validate
    if (
        headerData.fileMagic !== "ACROSS&DOWN" ||
        typeof headerData.checksum !== 'number' ||
        typeof headerData.cibChecksum !== 'number' ||
        typeof headerData.version !== 'string' ||
        typeof headerData.scrambledChecksum !== 'number' ||
        typeof headerData.width !== 'number' ||
        typeof headerData.height !== 'number' ||
        typeof headerData.numClues !== 'number' ||
        typeof headerData.scrambledTag !== 'number'
    ) {
        throw new Error("Invalid file");
    }

    const gridSize = headerData.width * headerData.height;

    const gridSolutionOffset = 0x34;
    const gridStateOffset = gridSolutionOffset + gridSize;
    const stringsOffset = gridStateOffset + gridSize;

    return {
        checksum: headerData.checksum,
        cibChecksum: headerData.cibChecksum,
        version: headerData.version,
        width: headerData.width,
        height: headerData.height,
        numClues: headerData.numClues,
        isScrambled: headerData.scrambledTag !== 0,
        gridSolutionOffset,
        gridStateOffset,
        stringsOffset
    }
}

function parsePuzzleText(buffer: Uint8Array, startPtr: number, numClues: number) {
    const utf8Decoder = new TextDecoder();
    let cursor = startPtr;

    const strings = [];

    const numOfPuzzleDataWords = 4;
    while (strings.length < numOfPuzzleDataWords + numClues) {
        const stringEnd = buffer.subarray(cursor, buffer.length).findIndex((byte) => byte === 0x00) + cursor;

        const word = utf8Decoder.decode(buffer.subarray(cursor, stringEnd));
        strings.push(word);
        cursor = stringEnd + 1;
    }

    if (strings.length < 4) {
        throw new Error("Invalid input");
    }

    return {
        title: strings[0],
        author: strings[1],
        copyright: strings[2],
        notes: strings[strings.length - 1],
        clues: strings.slice(3, 3 + numClues)!,
    }
}

function parseGrid(buffer: Uint8Array, startPtr: number, width: number, height: number) {
    const utf8Decoder = new TextDecoder();
    const grid: (string | null)[] = [];
    
    for (let i = startPtr; i < startPtr + width * height; i++) {
        if (buffer[i] === 0x2E) {
            grid.push(null);
        } else {
            grid.push(utf8Decoder.decode(buffer.subarray(i, i+1)))
        }
    }

    return grid;
}

function parseComponent(buf: Uint8Array, component: FileComponent) {
    const { offset, length, type } = component;
    const utf8Decoder = new TextDecoder();

    const subBuffer = buf.subarray(offset, offset + length);

    switch (type) {
        case 'string':
            let end = length;

            const stringEnd = subBuffer.findIndex((val) => val === 0x00);
            if (stringEnd !== -1) {
                end = stringEnd;
            }
            return utf8Decoder.decode(buf.subarray(offset, offset + end))
        case 'short':
            return readUInt16LE(buf, offset);
        case 'byte':
            return buf[offset];
    }
}

function getClueNumbers(grid: (string | null)[], width: number, height: number) {
    const clueNumbers: (number | null)[] = [];

    let clueNumber = 1;
    for (let i = 0; i < width * height; i++) {
        const cell = grid[i];
        if (!cell) {
            clueNumbers.push(null);
            continue;
        } else if (needsAcrossClue(grid, i, width, height) || needsDownClue(grid, i, width, height)) {
            clueNumbers.push(clueNumber);
            clueNumber++;
        } else {
            clueNumbers.push(null)
        }
    }

    return clueNumbers;
}

function needsAcrossClue(solutionGrid: (string | null)[], index: number, width: number, height: number) {
    if (!solutionGrid[index]) {
        return false;
    }

    const col = index % width;
    const isStart = col === 0 || !solutionGrid[index - 1];
    if (isStart) {
        const hasNext = col < width - 1 && solutionGrid[index + 1]
        if (hasNext) {
            return true;
        }
    }

    return false;
}

function needsDownClue(solutionGrid: (string | null)[], index: number, width: number, height: number) {
    if (!solutionGrid[index]) {
        return false;
    }

    const row = Math.floor(index / width);

    const isStart =
        row === 0 || !solutionGrid[index - width];

    const hasNext =
        row < height - 1 && solutionGrid[index + width];

    return isStart && hasNext;
}

function readUInt16LE(buf: Uint8Array, offset: number) {
    return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint16(offset, true);
}

const PUZ_HEADER_SPEC: Record<string, FileComponent> = {
    checksum: {
        offset: 0x00,
        length: 2,
        type: 'short'
    },
    fileMagic: {
        offset: 0x02,
        length: 0xC,
        type: 'string'
    },
    cibChecksum: {
        offset: 0x0E,
        length: 0x02,
        type: 'short'
    },
    version: {
        offset: 0x18,
        length: 0x04,
        type: 'string',
    },
    scrambledChecksum: {
        offset: 0x1E,
        length: 0x02,
        type: 'short',
    },
    width: {
        offset: 0x2C,
        length: 0x01,
        type: 'byte',
    },
    height: {
        offset: 0x2D,
        length: 0x01,
        type: 'byte',
    },
    numClues: {
        offset: 0x2E,
        length: 0x2, 
        type: 'short',
    },
    scrambledTag: {
        offset: 0x32,
        length: 0x2, 
        type: 'short',
    }
}