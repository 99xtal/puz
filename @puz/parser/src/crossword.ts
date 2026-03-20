export class Crossword {
    width: number;
    height: number;
    title?: string;
    author?: string;
    copyright?: string;
    notes?: string;

    constructor(options: CrosswordOptions) {
        this.width = options.width;
        this.height = options.height;
        this.title = options.title;
        this.author = options.author;
        this.copyright = options.copyright;
        this.notes = options.notes;
    }
}

interface CrosswordOptions {
    width: number,
    height: number,
    isScrambled: boolean,
    solution: (string | null)[],
    state: (string | null)[],
    clues: string[],
    title?: string,
    author?: string,
    copyright?: string,
    notes?: string,
}