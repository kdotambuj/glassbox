"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface Node {
    id: number;
    label: string;
    x: number;
    y: number;
    gCost: number;
    hCost: number;
    fCost: number;
    children: number[];
}

const ASTAR_LEVELS = [
    {
        name: "Shortest Estimate",
        nodeCount: 6,
        description: "Choose nodes based on g(cost so far) + h(estimated remaining).",
    },
    {
        name: "Heuristic Hunt",
        nodeCount: 10,
        description: "Multiple paths. The heuristic will help you find the shortcut.",
    },
    {
        name: "Optimal Path",
        nodeCount: 14,
        description: "Carefully balance path cost and goal distance.",
    }
];

export default function AStarGame() {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [visited, setVisited] = useState<Set<number>>(new Set());
    const [openSet, setOpenSet] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [gameStatus, setGameStatus] = useState<"SELECT_LEVEL" | "PLAYING" | "WON" | "LOST">("SELECT_LEVEL");
    const [message, setMessage] = useState("");

    const generateAStarGraph = (count: number) => {
        const newNodes: Node[] = [];
        const targetX = 550;
        const targetY = 300;

        for (let i = 0; i < count; i++) {
            const x = 100 + (i % 4) * 150;
            const y = 100 + Math.floor(i / 4) * 100;
            // Simplified heuristic: straight line distance to target area
            const h = Math.round(Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2) / 10);

            newNodes.push({
                id: i,
                label: String.fromCharCode(65 + i),
                x, y,
                gCost: 999, // default
                hCost: h,
                fCost: 999,
                children: []
            });
        }

        // Set start node costs
        newNodes[0].gCost = 0;
        newNodes[0].fCost = newNodes[0].hCost;

        // Connect nodes
        for (let i = 0; i < count; i++) {
            const c1 = i + 1;
            const c2 = i + 4;
            if (c1 < count) newNodes[i].children.push(c1);
            if (c2 < count) newNodes[i].children.push(c2);
        }
        return newNodes;
    };

    const startLevel = (levelIdx: number) => {
        const levelNodes = generateAStarGraph(ASTAR_LEVELS[levelIdx].nodeCount);
        setNodes(levelNodes);
        setVisited(new Set());
        setOpenSet([0]);
        setScore(0);
        setGameStatus("PLAYING");
        setMessage("Always pick the node in the Open Set with the MINIMUM f(n) = g + h");
    };

    const handleNodeClick = (nodeId: number) => {
        if (gameStatus !== "PLAYING") return;

        // Find node with lowest fCost in openSet
        const bestInOpenSet = openSet.reduce((prev, curr) => {
            const prevNode = nodes.find(n => n.id === prev);
            const currNode = nodes.find(n => n.id === curr);
            return (currNode?.fCost || 0) < (prevNode?.fCost || 0) ? curr : prev;
        }, openSet[0]);

        if (nodeId === bestInOpenSet) {
            const newVisited = new Set(visited);
            newVisited.add(nodeId);
            setVisited(newVisited);
            setScore(score + 10);

            const node = nodes.find(n => n.id === nodeId);
            let nextNodes = [...nodes];
            let newOpenSet = openSet.filter(id => id !== nodeId);

            if (node) {
                node.children.forEach(childId => {
                    if (!newVisited.has(childId)) {
                        const child = nextNodes.find(n => n.id === childId);
                        if (child) {
                            const newG = node.gCost + 10; // Fixed weight for simplicity
                            if (newG < child.gCost) {
                                child.gCost = newG;
                                child.fCost = child.gCost + child.hCost;
                                if (!newOpenSet.includes(childId)) {
                                    newOpenSet.push(childId);
                                }
                            }
                        }
                    }
                });
            }

            setNodes(nextNodes);
            setOpenSet(newOpenSet);

            if (newVisited.size === nodes.length || newOpenSet.length === 0) {
                setGameStatus("WON");
                setMessage("Heuristic mission complete! Efficient path found.");
            } else {
                setMessage("Excellent choice. The low f-cost node is the most promising.");
            }
        } else {
            setScore(Math.max(0, score - 5));
            setMessage("Incorrect. A* is greedy towards the lowest f(n) estimate.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            A* Heuristic Strategist
                        </h1>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Score</p>
                        <p className="text-2xl font-bold text-amber-400">{score}</p>
                    </div>
                </div>

                {gameStatus === "SELECT_LEVEL" && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {ASTAR_LEVELS.map((level, idx) => (
                            <motion.div
                                key={level.name}
                                whileHover={{ y: -8 }}
                                onClick={() => startLevel(idx)}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                            >
                                <h3 className="text-xl font-bold mb-2 text-amber-400">{level.name}</h3>
                                <p className="text-slate-400 text-sm mb-4">{level.description}</p>
                                <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
                                    <span>Deploy Strategy</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {(gameStatus === "PLAYING" || gameStatus === "WON" || gameStatus === "LOST") && (
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden min-h-[500px]">
                            {/* Message Overlay */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center w-full">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-block px-6 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium backdrop-blur-sm"
                                >
                                    {message}
                                </motion.div>
                            </div>

                            {/* Game SVG */}
                            <svg className="w-full h-[400px]">
                                {nodes.map(node => (
                                    <g key={node.id}>
                                        {node.children.map(childId => {
                                            const child = nodes.find(n => n.id === childId);
                                            if (!child) return null;
                                            return (
                                                <line
                                                    key={`${node.id}-${childId}`}
                                                    x1={node.x} y1={node.y}
                                                    x2={child.x} y2={child.y}
                                                    stroke={visited.has(node.id) && visited.has(childId) ? "#fbbf24" : "#334155"}
                                                    strokeWidth="2"
                                                />
                                            );
                                        })}
                                    </g>
                                ))}
                                {nodes.map(node => (
                                    <motion.g
                                        key={node.id}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => handleNodeClick(node.id)}
                                        className="cursor-pointer"
                                    >
                                        <circle
                                            cx={node.x} cy={node.y} r="32"
                                            fill={visited.has(node.id) ? "#92400e" : "#0f172a"}
                                            stroke={visited.has(node.id) ? "#fbbf24" : (openSet.includes(node.id) ? "#fbbf24" : "#334155")}
                                            strokeWidth="3"
                                        />
                                        <text
                                            x={node.x} y={node.y - 8}
                                            textAnchor="middle" dy=".3em"
                                            fill="white" className="font-bold select-none text-sm"
                                        >
                                            {node.label}
                                        </text>
                                        <text
                                            x={node.x} y={node.y + 12}
                                            textAnchor="middle" dy=".3em"
                                            fill={openSet.includes(node.id) ? "#fbbf24" : "#475569"}
                                            className="text-[10px] select-none uppercase font-bold"
                                        >
                                            f:{node.fCost > 500 ? '?' : node.fCost}
                                        </text>
                                    </motion.g>
                                ))}
                            </svg>

                            {/* Cost Legend */}
                            <div className="absolute bottom-4 left-4 bg-black/60 p-3 rounded-lg border border-white/10 text-[10px] text-slate-400 space-y-1">
                                <p><span className="text-amber-400 font-bold">f(n)</span> = total estimate</p>
                                <p><span className="text-slate-200">g(n)</span> = path cost (inc. 10 per edge)</p>
                                <p><span className="text-slate-200">h(n)</span> = distance estimate to goal</p>
                            </div>

                            {/* Open Set display */}
                            <div className="mt-8 flex flex-col items-center gap-2">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Open Set (Candidates)</span>
                                <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5 min-w-[300px] justify-center">
                                    {openSet.length === 0 && <span className="text-slate-600 text-sm italic">Empty</span>}
                                    {openSet.map((id) => (
                                        <motion.div
                                            key={id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold border bg-white/5 border-white/10 text-slate-400"
                                        >
                                            <span className="text-white">{nodes.find(n => n.id === id)?.label}</span>
                                            <span className="text-[8px] text-amber-500">f:{nodes.find(n => n.id === id)?.fCost}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setGameStatus("SELECT_LEVEL")}
                                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                            >
                                Change Level
                            </button>
                            <button
                                onClick={() => startLevel(currentLevel)}
                                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all"
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {gameStatus === "WON" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        >
                            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-12 text-center max-w-md shadow-2xl shadow-amber-500/20">
                                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Optimal Path Found!</h2>
                                <p className="text-slate-400 mb-8">You successfully used heuristics to find the most efficient route.</p>
                                <button
                                    onClick={() => setGameStatus("SELECT_LEVEL")}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
