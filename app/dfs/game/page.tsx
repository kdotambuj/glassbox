"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface Node {
    id: number;
    label: string;
    x: number;
    y: number;
    children: number[];
}

const DFS_LEVELS = [
    {
        name: "Linear Path",
        nodeCount: 6,
        description: "A simple linear path. Explore as deep as possible.",
    },
    {
        name: "Branching Maze",
        nodeCount: 10,
        description: "Multiple branches. Remember to backtrack when stuck.",
    },
    {
        name: "Deep Tree",
        nodeCount: 14,
        description: "Master the LIFO (Last-In First-Out) logic.",
    }
];

export default function DFSGame() {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [visited, setVisited] = useState<Set<number>>(new Set());
    const [stack, setStack] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [gameStatus, setGameStatus] = useState<"SELECT_LEVEL" | "PLAYING" | "WON" | "LOST">("SELECT_LEVEL");
    const [message, setMessage] = useState("");

    const generateGraph = (count: number) => {
        const newNodes: Node[] = [];
        const width = 600;
        const offset = 100;

        for (let i = 0; i < count; i++) {
            newNodes.push({
                id: i,
                label: String.fromCharCode(65 + i),
                x: offset + (i % 4) * 150,
                y: 100 + Math.floor(i / 4) * 100,
                children: []
            });
        }

        // Connect nodes to form a tree-like structure biased for depth
        for (let i = 0; i < count; i++) {
            const child1 = i + 1;
            const child2 = i + 4;
            if (child1 < count) newNodes[i].children.push(child1);
            if (child2 < count) newNodes[i].children.push(child2);
        }
        return newNodes;
    };

    const startLevel = (levelIdx: number) => {
        const levelNodes = generateGraph(DFS_LEVELS[levelIdx].nodeCount);
        setNodes(levelNodes);
        setVisited(new Set());
        setStack([0]);
        setScore(0);
        setGameStatus("PLAYING");
        setMessage("Explore the graph as deep as possible (DFS)");
    };

    const handleNodeClick = (nodeId: number) => {
        if (gameStatus !== "PLAYING") return;

        const expectedNodeId = stack[stack.length - 1];

        if (nodeId === expectedNodeId) {
            const newVisited = new Set(visited);
            newVisited.add(nodeId);
            setVisited(newVisited);
            setScore(score + 10);

            const node = nodes.find(n => n.id === nodeId);
            let newStack = [...stack];
            newStack.pop(); // Remove current as we are "visiting" it

            if (node) {
                // In DFS, we push children in reverse order to explore the first child first
                const unvisitedChildren = [...node.children].reverse().filter(id => !newVisited.has(id));
                newStack = [...newStack, ...unvisitedChildren];
            }
            setStack(newStack);

            if (newVisited.size === nodes.length) {
                setGameStatus("WON");
                setMessage("Incredible! You've mastered Depth-First Search.");
            } else {
                setMessage("Correct! Dive deeper into the next unvisited branch.");
            }
        } else {
            setScore(Math.max(0, score - 5));
            setMessage("Not quite. DFS prioritizes the most recently discovered nodes (Stack).");
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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            DFS Explorer Challenge
                        </h1>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Score</p>
                        <p className="text-2xl font-bold text-purple-400">{score}</p>
                    </div>
                </div>

                {gameStatus === "SELECT_LEVEL" && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {DFS_LEVELS.map((level, idx) => (
                            <motion.div
                                key={level.name}
                                whileHover={{ y: -8 }}
                                onClick={() => startLevel(idx)}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                            >
                                <h3 className="text-xl font-bold mb-2 text-purple-400">{level.name}</h3>
                                <p className="text-slate-400 text-sm mb-4">{level.description}</p>
                                <div className="flex items-center gap-2 text-purple-400 font-medium text-sm">
                                    <span>Start Diving</span>
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
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-6 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium backdrop-blur-sm"
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
                                                    stroke={visited.has(node.id) && visited.has(childId) ? "#c084fc" : "#334155"}
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
                                            cx={node.x} cy={node.y} r="25"
                                            fill={visited.has(node.id) ? "#7e22ce" : "#0f172a"}
                                            stroke={visited.has(node.id) ? "#c084fc" : (stack[stack.length - 1] === node.id ? "#f59e0b" : "#334155")}
                                            strokeWidth="3"
                                        />
                                        <text
                                            x={node.x} y={node.y}
                                            textAnchor="middle" dy=".3em"
                                            fill="white" className="font-bold select-none"
                                        >
                                            {node.label}
                                        </text>
                                    </motion.g>
                                ))}
                            </svg>

                            {/* Stack display */}
                            <div className="mt-8 flex flex-col items-center gap-2">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Stack (Top on right)</span>
                                <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5 min-w-[300px] justify-center">
                                    {stack.length === 0 && <span className="text-slate-600 text-sm italic">Empty</span>}
                                    {stack.map((id, idx) => (
                                        <motion.div
                                            key={`${id}-${idx}`}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border ${idx === stack.length - 1 ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-white/5 border-white/10 text-slate-400"}`}
                                        >
                                            {nodes.find(n => n.id === id)?.label}
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
                                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all"
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
                            <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-12 text-center max-w-md shadow-2xl shadow-purple-500/20">
                                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Level Mastered!</h2>
                                <p className="text-slate-400 mb-8">You successfully implemented the LIFO depth-first traversal logic.</p>
                                <button
                                    onClick={() => setGameStatus("SELECT_LEVEL")}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
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
