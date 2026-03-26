import type React from "react";

type CrosswordProps = {
    solution: (string | null)[][];
    onSolve?: () => void;
}

const VIEWBOX_SIZE = 800;

export default function Crossword({ solution }: CrosswordProps) {
    return (
        <svg viewBox="0 0 800 800">
            {solution.map((row, rowNum) => (
                row.map((cell, colNum) => {
                    const cellSize = VIEWBOX_SIZE / solution.length // <-- ??
                    const x = colNum * cellSize;
                    const y = rowNum * cellSize;

                    return (
                        <Cell
                            x={x}
                            y={y}
                            width={cellSize}
                            height={cellSize}
                            isBlock={!cell}
                        />
                    )
                })
            ))}
        </svg>
    )
}

type CellProps = React.SVGProps<SVGRectElement> & {
    isBlock?: boolean
}

function Cell({ isBlock = false, ...rectProps }: CellProps) {
    const style = isBlock ? "xwd_cell--block" : "xwd_cell";

    return (
        <g className={style}>
            <rect {...rectProps} />
        </g>
    )
}