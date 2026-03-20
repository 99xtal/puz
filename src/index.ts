import { readFile } from "fs/promises";
import { parse } from "@puz/parser";

async function main() {
    try {
        const file = await readFile('./examples/reel.puz');
        const puz = parse(file);

        console.log(puz);
    } catch (err) {
        console.error(err);
    }
}

main();