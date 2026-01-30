"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// Types
type NodeType = "empty" | "start" | "end" | "wall" | "visited" | "frontier" | "path" | "current";

interface GridNode {
    row: number;
    col: number;
    type: NodeType;
    distance: number;
    parent: { row: number; col: number } | null;
}

interface QueueItem {
    row: number;
    col: number;
    step: number;
}

interface AlgorithmState {
    queue: QueueItem[];
    visited: Set<string>;
    current: { row: number; col: number } | null;
    path: { row: number; col: number }[];
    step: number;
    isRunning: boolean;
    isComplete: boolean;
    found: boolean;
}

interface Stats {
    nodesExplored: number;
    pathLength: number;
    timeTaken: number;
}

// Constants
const GRID_ROWS = 15;
const GRID_COLS = 30;
const DEFAULT_START = { row: 7, col: 5 };
const DEFAULT_END = { row: 7, col: 24 };

// BFS Pseudocode
const pseudocode = [
    { line: "function BFS(start, end):", highlight: 0 },
    { line: "  queue ← [start]", highlight: 1 },
    { line: "  visited ← {start}", highlight: 2 },
    { line: "  while queue is not empty:", highlight: 3 },
    { line: "    current ← queue.dequeue()", highlight: 4 },
    { line: "    if current = end:", highlight: 5 },
    { line: "      return reconstruct_path()", highlight: 6 },
    { line: "    for each neighbor of current:", highlight: 7 },
    { line: "      if neighbor not in visited:", highlight: 8 },
    { line: "        visited.add(neighbor)", highlight: 9 },
    { line: "        queue.enqueue(neighbor)", highlight: 10 },
    { line: "  return no path found", highlight: 11 },
];

// Helper functions
const createKey = (row: number, col: number) => `${row},${col}`;

const getNeighbors = (row: number, col: number, grid: GridNode[][]) => {
    const neighbors: { row: number; col: number }[] = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1], // 4-directional
    ];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
            newRow >= 0 && newRow < GRID_ROWS &&
            newCol >= 0 && newCol < GRID_COLS &&
            grid[newRow][newCol].type !== "wall"
        ) {
            neighbors.push({ row: newRow, col: newCol });
        }
    }
    return neighbors;
};

const createInitialGrid = (start: { row: number; col: number }, end: { row: number; col: number }): GridNode[][] => {
    const grid: GridNode[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        const currentRow: GridNode[] = [];
        for (let col = 0; col < GRID_COLS; col++) {
            let type: NodeType = "empty";
            if (row === start.row && col === start.col) type = "start";
            else if (row === end.row && col === end.col) type = "end";

            currentRow.push({
                row,
                col,
                type,
                distance: Infinity,
                parent: null,
            });
        }
        grid.push(currentRow);
    }
    return grid;
};

// Node color mapping
const getNodeColor = (type: NodeType) => {
    switch (type) {
        case "start": return "bg-emerald-500 shadow-lg shadow-emerald-500/50";
        case "end": return "bg-rose-500 shadow-lg shadow-rose-500/50";
        case "wall": return "bg-slate-700";
        case "visited": return "bg-blue-500/60";
        case "frontier": return "bg-cyan-400 shadow-md shadow-cyan-400/50";
        case "current": return "bg-yellow-400 shadow-lg shadow-yellow-400/50 scale-110";
        case "path": return "bg-amber-400 shadow-lg shadow-amber-400/50";
        default: return "bg-slate-800/50 hover:bg-slate-700/50";
    }
};

export default function BFSPage() {
    // State
    const [start, setStart] = useState(DEFAULT_START);
    const [end, setEnd] = useState(DEFAULT_END);
    const [grid, setGrid] = useState<GridNode[][]>(() => createInitialGrid(DEFAULT_START, DEFAULT_END));
    const [speed, setSpeed] = useState(100);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawMode, setDrawMode] = useState<"wall" | "start" | "end">("wall");
    const [currentPseudocodeLine, setCurrentPseudocodeLine] = useState(-1);
    const [narration, setNarration] = useState("Click on the grid to draw walls, then press Play to start BFS visualization.");
    const [stats, setStats] = useState<Stats>({ nodesExplored: 0, pathLength: 0, timeTaken: 0 });

    const [algorithmState, setAlgorithmState] = useState<AlgorithmState>({
        queue: [],
        visited: new Set(),
        current: null,
        path: [],
        step: 0,
        isRunning: false,
        isComplete: false,
        found: false,
    });

    const animationRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    // Reset everything
    const resetGrid = useCallback(() => {
        if (animationRef.current) clearTimeout(animationRef.current);
        setGrid(createInitialGrid(start, end));
        setAlgorithmState({
            queue: [],
            visited: new Set(),
            current: null,
            path: [],
            step: 0,
            isRunning: false,
            isComplete: false,
            found: false,
        });
        setCurrentPseudocodeLine(-1);
        setNarration("Grid reset. Click to draw walls, then press Play to start.");
        setStats({ nodesExplored: 0, pathLength: 0, timeTaken: 0 });
    }, [start, end]);

    // Clear only visualization (keep walls)
    const clearVisualization = useCallback(() => {
        if (animationRef.current) clearTimeout(animationRef.current);
        setGrid(prev => prev.map(row => row.map(node => ({
            ...node,
            type: node.type === "start" ? "start" :
                node.type === "end" ? "end" :
                    node.type === "wall" ? "wall" : "empty",
            distance: Infinity,
            parent: null,
        }))));
        setAlgorithmState({
            queue: [],
            visited: new Set(),
            current: null,
            path: [],
            step: 0,
            isRunning: false,
            isComplete: false,
            found: false,
        });
        setCurrentPseudocodeLine(-1);
        setNarration("Visualization cleared. Press Play to run BFS again.");
        setStats({ nodesExplored: 0, pathLength: 0, timeTaken: 0 });
    }, []);

    // Initialize BFS
    const initializeBFS = useCallback(() => {
        const initialQueue: QueueItem[] = [{ ...start, step: 0 }];
        const initialVisited = new Set([createKey(start.row, start.col)]);

        setAlgorithmState({
            queue: initialQueue,
            visited: initialVisited,
            current: null,
            path: [],
            step: 0,
            isRunning: true,
            isComplete: false,
            found: false,
        });

        setGrid(prev => prev.map(row => row.map(node => ({
            ...node,
            type: node.type === "start" ? "start" :
                node.type === "end" ? "end" :
                    node.type === "wall" ? "wall" : "empty",
            distance: node.row === start.row && node.col === start.col ? 0 : Infinity,
            parent: null,
        }))));

        setCurrentPseudocodeLine(1);
        setNarration(`BFS initialized. Start node (${start.row}, ${start.col}) added to queue.`);
        startTimeRef.current = Date.now();
    }, [start]);

    // Single BFS step
    const stepBFS = useCallback(() => {
        setAlgorithmState(prev => {
            if (prev.queue.length === 0 || prev.isComplete) {
                if (!prev.found && !prev.isComplete) {
                    setNarration("Queue is empty. No path found to the target!");
                    setCurrentPseudocodeLine(11);
                    setStats(s => ({ ...s, timeTaken: Date.now() - startTimeRef.current }));
                }
                return { ...prev, isRunning: false, isComplete: true };
            }

            const newQueue = [...prev.queue];
            const current = newQueue.shift()!;
            const newVisited = new Set(prev.visited);
            const newStep = prev.step + 1;

            // Update grid for current node
            setGrid(g => {
                const newGrid = g.map(row => row.map(node => ({ ...node })));
                // Clear previous current
                for (let r = 0; r < GRID_ROWS; r++) {
                    for (let c = 0; c < GRID_COLS; c++) {
                        if (newGrid[r][c].type === "current") {
                            newGrid[r][c].type = "visited";
                        }
                        if (newGrid[r][c].type === "frontier") {
                            newGrid[r][c].type = "visited";
                        }
                    }
                }
                // Mark current
                if (newGrid[current.row][current.col].type !== "start" && newGrid[current.row][current.col].type !== "end") {
                    newGrid[current.row][current.col].type = "current";
                }
                return newGrid;
            });

            setCurrentPseudocodeLine(4);
            setNarration(`Step ${newStep}: Dequeued node (${current.row}, ${current.col}) from the front of the queue.`);
            setStats(s => ({ ...s, nodesExplored: newVisited.size }));

            // Check if we found the end
            if (current.row === end.row && current.col === end.col) {
                // Reconstruct path
                const path: { row: number; col: number }[] = [];
                let node = { row: current.row, col: current.col };

                setGrid(g => {
                    const newGrid = g.map(row => row.map(n => ({ ...n })));
                    let curr: { row: number; col: number } | null = { row: current.row, col: current.col };
                    while (curr) {
                        path.unshift(curr);
                        if (newGrid[curr.row][curr.col].type !== "start" && newGrid[curr.row][curr.col].type !== "end") {
                            newGrid[curr.row][curr.col].type = "path";
                        }
                        curr = newGrid[curr.row][curr.col].parent;
                    }
                    return newGrid;
                });

                setCurrentPseudocodeLine(6);
                setNarration(`🎉 Path found! Reached target (${end.row}, ${end.col}) in ${newStep} steps. Path length: ${path.length} nodes.`);
                setStats(s => ({
                    ...s,
                    pathLength: path.length,
                    timeTaken: Date.now() - startTimeRef.current,
                    nodesExplored: newVisited.size
                }));

                return {
                    ...prev,
                    queue: [],
                    current: null,
                    path,
                    step: newStep,
                    isRunning: false,
                    isComplete: true,
                    found: true
                };
            }

            // Get neighbors
            const neighbors = getNeighbors(current.row, current.col, grid);
            const addedNeighbors: { row: number; col: number }[] = [];

            setGrid(g => {
                const newGrid = g.map(row => row.map(n => ({ ...n })));

                for (const neighbor of neighbors) {
                    const key = createKey(neighbor.row, neighbor.col);
                    if (!newVisited.has(key)) {
                        newVisited.add(key);
                        newQueue.push({ ...neighbor, step: newStep });
                        addedNeighbors.push(neighbor);

                        newGrid[neighbor.row][neighbor.col].parent = { row: current.row, col: current.col };
                        newGrid[neighbor.row][neighbor.col].distance = newStep;

                        if (newGrid[neighbor.row][neighbor.col].type !== "end") {
                            newGrid[neighbor.row][neighbor.col].type = "frontier";
                        }
                    }
                }
                return newGrid;
            });

            if (addedNeighbors.length > 0) {
                setCurrentPseudocodeLine(10);
                setTimeout(() => {
                    setNarration(`Added ${addedNeighbors.length} unvisited neighbor(s) to queue: ${addedNeighbors.map(n => `(${n.row},${n.col})`).join(", ")}`);
                }, speed / 2);
            }

            return {
                ...prev,
                queue: newQueue,
                visited: newVisited,
                current,
                step: newStep,
            };
        });
    }, [end, grid, speed]);

    // Play animation
    const play = useCallback(() => {
        if (algorithmState.isComplete) {
            clearVisualization();
            setTimeout(() => {
                initializeBFS();
            }, 100);
            return;
        }

        if (algorithmState.queue.length === 0 && !algorithmState.isRunning) {
            initializeBFS();
        } else {
            setAlgorithmState(prev => ({ ...prev, isRunning: true }));
        }
    }, [algorithmState.isComplete, algorithmState.queue.length, algorithmState.isRunning, clearVisualization, initializeBFS]);

    // Pause
    const pause = useCallback(() => {
        setAlgorithmState(prev => ({ ...prev, isRunning: false }));
        if (animationRef.current) clearTimeout(animationRef.current);
    }, []);

    // Animation loop
    useEffect(() => {
        if (algorithmState.isRunning && !algorithmState.isComplete) {
            animationRef.current = setTimeout(stepBFS, speed);
        }
        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [algorithmState.isRunning, algorithmState.isComplete, algorithmState.step, speed, stepBFS]);

    // Grid interaction handlers
    const handleNodeMouseDown = (row: number, col: number) => {
        if (algorithmState.isRunning) return;

        const node = grid[row][col];
        if (node.type === "start" || node.type === "end") return;

        setIsDrawing(true);
        toggleWall(row, col);
    };

    const handleNodeMouseEnter = (row: number, col: number) => {
        if (!isDrawing || algorithmState.isRunning) return;

        const node = grid[row][col];
        if (node.type === "start" || node.type === "end") return;

        toggleWall(row, col);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const toggleWall = (row: number, col: number) => {
        setGrid(prev => {
            const newGrid = prev.map(r => r.map(n => ({ ...n })));
            newGrid[row][col].type = newGrid[row][col].type === "wall" ? "empty" : "wall";
            return newGrid;
        });
    };

    // Generate random maze
    const generateMaze = useCallback(() => {
        if (algorithmState.isRunning) return;

        setGrid(prev => {
            const newGrid = createInitialGrid(start, end);
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLS; col++) {
                    if (
                        (row !== start.row || col !== start.col) &&
                        (row !== end.row || col !== end.col) &&
                        Math.random() < 0.3
                    ) {
                        newGrid[row][col].type = "wall";
                    }
                }
            }
            return newGrid;
        });

        setAlgorithmState({
            queue: [],
            visited: new Set(),
            current: null,
            path: [],
            step: 0,
            isRunning: false,
            isComplete: false,
            found: false,
        });
        setNarration("Random maze generated. Press Play to visualize BFS!");
    }, [algorithmState.isRunning, start, end]);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Header */}
            <motion.header
                className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back</span>
                        </Link>
                        <div className="h-6 w-px bg-white/20" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Breadth-First Search (BFS)
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Speed:</span>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            value={510 - speed}
                            onChange={(e) => setSpeed(510 - parseInt(e.target.value))}
                            className="w-24 accent-cyan-500"
                        />
                        <span className="text-xs text-slate-500 w-12">{speed}ms</span>
                    </div>
                </div>
            </motion.header>

            <div className="container mx-auto px-6 py-6">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Main Grid Area */}
                    <div className="xl:col-span-3 space-y-4">
                        {/* Controls */}
                        <motion.div
                            className="flex flex-wrap gap-3 items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex gap-2">
                                {!algorithmState.isRunning ? (
                                    <motion.button
                                        onClick={play}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg shadow-emerald-500/25"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        {algorithmState.isComplete ? "Restart" : "Play"}
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={pause}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                                        </svg>
                                        Pause
                                    </motion.button>
                                )}

                                <motion.button
                                    onClick={stepBFS}
                                    disabled={algorithmState.isRunning || algorithmState.isComplete}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                    Step
                                </motion.button>
                            </div>

                            <div className="h-8 w-px bg-white/20" />

                            <motion.button
                                onClick={clearVisualization}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Clear Path
                            </motion.button>

                            <motion.button
                                onClick={resetGrid}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Reset All
                            </motion.button>

                            <motion.button
                                onClick={generateMaze}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                                Random Maze
                            </motion.button>
                        </motion.div>

                        {/* Grid */}
                        <motion.div
                            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 overflow-x-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div
                                className="grid gap-[2px] mx-auto w-fit"
                                style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                            >
                                {grid.map((row, rowIdx) =>
                                    row.map((node, colIdx) => (
                                        <motion.div
                                            key={`${rowIdx}-${colIdx}`}
                                            onMouseDown={() => handleNodeMouseDown(rowIdx, colIdx)}
                                            onMouseEnter={() => handleNodeMouseEnter(rowIdx, colIdx)}
                                            className={`w-6 h-6 rounded-sm cursor-pointer transition-all duration-150 ${getNodeColor(node.type)} flex items-center justify-center text-[8px] font-bold`}
                                            initial={false}
                                            animate={{
                                                scale: node.type === "current" ? 1.1 : 1,
                                            }}
                                            whileHover={{ scale: algorithmState.isRunning ? 1 : 1.2 }}
                                        >
                                            {node.type === "start" && "S"}
                                            {node.type === "end" && "E"}
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-emerald-500" />
                                    <span className="text-slate-400">Start</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-rose-500" />
                                    <span className="text-slate-400">End</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-slate-700" />
                                    <span className="text-slate-400">Wall</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-yellow-400" />
                                    <span className="text-slate-400">Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-cyan-400" />
                                    <span className="text-slate-400">Frontier</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-blue-500/60" />
                                    <span className="text-slate-400">Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-amber-400" />
                                    <span className="text-slate-400">Path</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Narration */}
                        <motion.div
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-1">Algorithm Narration</h3>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={narration}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-slate-400 text-sm leading-relaxed"
                                        >
                                            {narration}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <motion.div
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Statistics
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Steps</span>
                                    <span className="text-white font-mono font-bold">{algorithmState.step}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Nodes Explored</span>
                                    <span className="text-white font-mono font-bold">{stats.nodesExplored}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Path Length</span>
                                    <span className="text-white font-mono font-bold">{stats.pathLength || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Time</span>
                                    <span className="text-white font-mono font-bold">{stats.timeTaken ? `${stats.timeTaken}ms` : "-"}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Queue Visualization */}
                        <motion.div
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Queue (FIFO)
                                <span className="ml-auto text-xs text-slate-500">{algorithmState.queue.length} items</span>
                            </h3>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                <AnimatePresence>
                                    {algorithmState.queue.slice(0, 20).map((item, idx) => (
                                        <motion.div
                                            key={`${item.row}-${item.col}`}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className={`px-2 py-1 rounded text-xs font-mono ${idx === 0
                                                    ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50"
                                                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                                }`}
                                        >
                                            ({item.row},{item.col})
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {algorithmState.queue.length > 20 && (
                                    <span className="text-slate-500 text-xs">+{algorithmState.queue.length - 20} more</span>
                                )}
                                {algorithmState.queue.length === 0 && (
                                    <span className="text-slate-500 text-xs italic">Queue is empty</span>
                                )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/5 text-xs text-slate-500">
                                <span className="text-yellow-400">Front</span> → Dequeue | Enqueue → <span className="text-cyan-400">Back</span>
                            </div>
                        </motion.div>

                        {/* Pseudocode */}
                        <motion.div
                            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Pseudocode
                            </h3>
                            <div className="font-mono text-xs space-y-1">
                                {pseudocode.map((line, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={`px-2 py-1 rounded transition-colors ${currentPseudocodeLine === line.highlight
                                                ? "bg-cyan-500/30 text-cyan-300 border-l-2 border-cyan-400"
                                                : "text-slate-500"
                                            }`}
                                        animate={{
                                            backgroundColor: currentPseudocodeLine === line.highlight ? "rgba(6, 182, 212, 0.3)" : "transparent",
                                        }}
                                    >
                                        <span className="text-slate-600 mr-2">{idx + 1}</span>
                                        {line.line}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-sm font-semibold text-white mb-2">About BFS</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                BFS explores nodes level by level, guaranteeing the shortest path in unweighted graphs.
                                It uses a <span className="text-cyan-400 font-semibold">queue (FIFO)</span> to track nodes to visit.
                            </p>
                            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-slate-500">Time:</span>
                                    <span className="text-white ml-1">O(V + E)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Space:</span>
                                    <span className="text-white ml-1">O(V)</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}