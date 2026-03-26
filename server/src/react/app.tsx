import React from "react";

export default function App() {
  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      const buffer = new Uint8Array(event.target.result as ArrayBuffer);
      console.log(buffer);
    }

    reader.onerror = (err) => {
      console.error(err);
    }

    reader.readAsArrayBuffer(file);
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Puz</title>
      </head>
      <body>
          <input type="file" onChange={(e) => handleFileChange(e.target.files)} />
          <br />
          <div className="flex flex-col justify-center">
              <section className="flex flex-col justify-center">
                  <h2 id="title"></h2>
                  <p id="author"></p>
                  <p id="copyright"></p>
              </section>
              <div className="flex justify-center">
                <svg id="board" viewBox="0 0 800 800"></svg>
              </div>
              <div className="flex justify-center">
                  <h3 id="cluebox"></h3>
              </div>
          </div>
      </body>
    </html>
  );
}