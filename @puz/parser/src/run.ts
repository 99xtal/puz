#!/usr/bin/env node

import { readFile } from "fs/promises";
import { parse } from "./index.js";

async function main() {
    const args = process.argv;

    for (const arg of args.slice(2)) {
        try {
            const file = await readFile(arg);
            const puz = parse(file);

            console.log(puz);
        } catch (err) {
            console.error(err);
        }
    }
}

main();