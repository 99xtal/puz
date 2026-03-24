import { parse } from "@puz/parser"

const fileInput = document.getElementById('fileInput');
const title = document.getElementById('title');
const author = document.getElementById('author');
const copyright = document.getElementById('copyright');
const output = document.getElementById('output');
const acrossList = document.getElementById('across-list');
const downList = document.getElementById('down-list');
const svg = document.getElementById('board');

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX_SIZE = 800;

const state = {
  title: undefined,
  author: undefined,
  copyright: undefined,
  width: 0,
  height: 0,
  cells: [],
  clues: {
    across: {},
    down: {},
  },
};

function dispatch(action) {
  switch (action.type) {
    case "loadPuzzle": {
      const {
        title,
        author,
        copyright,
        height,
        width,
        solution,
        clueNumbers,
        clues,
      } = action.payload;

      state.title = title;
      state.author = author;
      state.copyright = copyright;
      state.height = height;
      state.width = width;
      state.clues = clues;

      const cells = [];
      for (let i = 0; i < width * height; i++) {
        const soln = solution[i];
        if (!soln) {
          cells.push({
            block: true,
          });
        } else {
          cells.push({
            block: false,
            solution: soln,
            number: clueNumbers[i],
          })
        }
      }

      state.cells = cells;
    }
  }

  render();
}

function createSvgEl(name, attrs = {}) {
  const el = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function render() {
  svg.innerHTML = "";

  title.textContent = state.title;
  author.textContent = state.author;
  copyright.textContent = state.copyright;

  Object.entries(state.clues.across).forEach(([clueNum, clue]) => {
    const item = document.createElement('li');
    item.innerText = `${clueNum}. ${clue}`;
    item.classList.add("clue");
    acrossList.appendChild(item);
  })

  Object.entries(state.clues.down).forEach(([clueNum, clue]) => {
    const item = document.createElement('li');
    item.innerText = `${clueNum}. ${clue}`;
    item.classList.add("clue");
    downList.appendChild(item);
  })

  state.cells.forEach((cell, index) => {
    const row = Math.floor(index / state.height)
    const col = index % state.width;
    const cellHeight = VIEWBOX_SIZE / state.height;
    const cellWidth = VIEWBOX_SIZE / state.width;
    const x = col * cellWidth;
    const y = row * cellHeight;

    const group = createSvgEl("g");
    group.classList.add("cell");

    if (cell.block) group.classList.add("block");

    const rect = createSvgEl("rect", {
      x,
      y,
      width: cellWidth,
      height: cellHeight
    })

    group.appendChild(rect);

    if (!cell.block) {
      if (cell.number) {
        const number = createSvgEl("text", {
          x: x + 4,
          y: y + 4,
          class: "number",
        });
        number.textContent = cell.number;
        group.appendChild(number);
      }

      const letter = createSvgEl("text", {
        x: x + cellWidth / 2,
        y: y + cellHeight / 2,
        class: "letter",
      });

      letter.textContent = cell.solution;
      group.appendChild(letter);
    }

    svg.appendChild(group);
  })

  fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (event) => {
        const buffer = new Uint8Array(event.target.result);
        const puzzle = parse(buffer);
        dispatch({ type: "loadPuzzle", payload: puzzle });
      }

      reader.onerror = (err) => {
        console.error(err);
        output.textContent = err;
      }

      reader.readAsArrayBuffer(file);
  });
}

render();