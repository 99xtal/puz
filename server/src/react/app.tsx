import React, { useState } from "react";
import { parse, type Puz } from "@puz/parser"
import Crossword from "./crossword.js";

const readBuffer = async (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      const buffer = new Uint8Array(event.target.result as ArrayBuffer);
      resolve(buffer);
    }

    reader.onerror = (e) => reject(e);

    reader.readAsArrayBuffer(file);
  })
}

function parsePuzGrid(puzGrid: (string | null)[], width: number, height: number) {
  const grid = []

  for (let i = 0; i < height * width; i += width) {
    grid.push(puzGrid.slice(i, i+width));
  }

  return grid;
}

export default function App() {
  const [puz, setPuz] = useState<Puz>();

  const handleFileChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const buf = await readBuffer(file);

    const crosswordData = parse(buf);
    setPuz(crosswordData);
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="styles.css" />
        <title>Puz</title>
      </head>
      <body>
          <input type="file" onChange={(e) => handleFileChange(e.target.files)} />
          <br />
          {puz && (
            <div className="flex flex-col justify-center">
              <section className="flex flex-col justify-center">
                  <h2>{puz.title}</h2>
                  <p>{puz.author}</p>
                  <p>{puz.copyright}</p>
              </section>
              <div className="flex justify-center">
                <Crossword
                  solution={parsePuzGrid(puz.solution, puz.width, puz.height)}
                />
              </div>
              <div className="flex justify-center">
                  <h3 id="cluebox"></h3>
              </div>
            </div>
          )}
      </body>
    </html>
  );
}