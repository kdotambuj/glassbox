"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// Types
interface TreeNode {
    id: number;
    label: string;
    x: number;
    y: number;
    children: number[];
    gCost: number;
    hCost: number;
    fCost: number;
    parent: number | null;
}

type StepType =
    | "INIT"
    | "SELECT_MIN"
    | "CHECK_GOAL"
    | "MARK_CLOSED"
    | "EXPLORE_NEIGHBOR"
    | "UPDATE_COSTS"
    | "ADD_OPEN"
    | "PATH_FOUND"
    | "DONE";

interface AStarState {
    current: number | null;
    openSet: number[];
    closedSet: Set<number>;
    visitOrder: number[];
    path: number[];
    isRunning: boolean;
    isComplete: boolean;
    stepMessage: string;
    activeEdge: { from: number; to: number } | null;
    stepType: StepType;
    goalNode: number;
}

type HeuristicType = "depth" | "euclidean" | "manhattan";

// Pseudocode for A* Algorithm
const ASTAR_PSEUDOCODE = [
    { text: "A*(start, goal):", indent: 0, step: 0 },
    { text: "openSet.add(start)", indent: 1, step: 1 },
    { text: "g[start] = 0", indent: 1, step: 2 },
    { text: "f[start] = h(start, goal)", indent: 1, step: 3 },
    { text: "while openSet not empty:", indent: 1, step: 4 },
    { text: "current = min f in openSet", indent: 2, step: 5 },
    { text: "if current == goal:", indent: 2, step: 6 },
    { text: "return reconstruct_path()", indent: 3, step: 7 },
    { text: "openSet.remove(current)", indent: 2, step: 8 },
    { text: "closedSet.add(current)", indent: 2, step: 9 },
    { text: "for neighbor in current.neighbors:", indent: 2, step: 10 },
    { text: "if neighbor in closedSet: skip", indent: 3, step: 11 },
    { text: "tentative_g = g[current] + 1", indent: 3, step: 12 },
    { text: "if tentative_g < g[neighbor]:", indent: 3, step: 13 },
    { text: "parent[neighbor] = current", indent: 4, step: 14 },
    { text: "g[neighbor] = tentative_g", indent: 4, step: 15 },
    { text: "f[neighbor] = g + h(neighbor)", indent: 4, step: 16 },
    { text: "openSet.add(neighbor)", indent: 4, step: 17 },
];

const stepMap: Record<StepType, number[]> = {
    INIT: [0, 1, 2, 3],
    SELECT_MIN: [4, 5],
    CHECK_GOAL: [6],
    PATH_FOUND: [7],
    MARK_CLOSED: [8, 9],
    EXPLORE_NEIGHBOR: [10, 11],
    UPDATE_COSTS: [12, 13, 14, 15, 16],
    ADD_OPEN: [17],
    DONE: [4],
};

// Generate tree based on node count
const createTreeGraph = (nodeCount: number): TreeNode[] => {
    const nodes: TreeNode[] = [];
    const width = 480;
    const layerHeight = 70;
    const startY = 50;
    const offsetX = 180;

    const layers: number[][] = [];
    let remaining = nodeCount;
    let nodeId = 0;

    layers.push([nodeId++]);
    remaining--;

    while (remaining > 0) {
        const prevLayer = layers[layers.length - 1];
        const maxInLayer = Math.min(remaining, prevLayer.length * 2 + 1);
        const layer: number[] = [];
        for (let i = 0; i < maxInLayer && remaining > 0; i++) {
            layer.push(nodeId++);
            remaining--;
        }
        if (layer.length > 0) layers.push(layer);
    }

    layers.forEach((layer, lIdx) => {
        const y = startY + lIdx * layerHeight;
        const spacing = width / (layer.length + 1);
        layer.forEach((id, idx) => {
            nodes.push({
                id,
                label: String(id),
                x: offsetX + spacing * (idx + 1),
                y,
                children: [],
                gCost: Infinity,
                hCost: Infinity,
                fCost: Infinity,
                parent: null,
            });
        });
    });

    for (let lIdx = 0; lIdx < layers.length - 1; lIdx++) {
        const parents = layers[lIdx];
        const children = layers[lIdx + 1];
        let childIdx = 0;

        parents.forEach(parentId => {
            const childrenPerParent = Math.ceil(children.length / parents.length);
            for (let i = 0; i < childrenPerParent && childIdx < children.length; i++) {
                nodes[parentId].children.push(children[childIdx]);
                childIdx++;
            }
        });
    }

    return nodes;
};

// Heuristic functions
const heuristics: Record<HeuristicType, (node: TreeNode, goal: TreeNode) => number> = {
    depth: (node, goal) => Math.abs(node.y - goal.y) / 70,
    euclidean: (node, goal) => Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2)) / 100,
    manhattan: (node, goal) => (Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y)) / 100,
};

const heuristicDescriptions: Record<HeuristicType, string> = {
    depth: "Distance based on tree depth (vertical)",
    euclidean: "Straight-line distance in 2D space",
    manhattan: "Sum of horizontal and vertical distances",
};

export default function AStarPage() {
    const [nodeCount, setNodeCount] = useState(8);
    const [graphType, setGraphType] = useState<"directed" | "undirected">("directed");
    const [heuristic, setHeuristic] = useState<HeuristicType>("depth");

    const [nodes, setNodes] = useState<TreeNode[]>([]);
    const [speed, setSpeed] = useState(800);
    const [showTheory, setShowTheory] = useState(false);
    const [showBuildGraph, setShowBuildGraph] = useState(false);
    const [showAlert, setShowAlert] = useState<string | null>(null);
    const [stepHistory, setStepHistory] = useState<AStarState[]>([]);

    // Build graph state
    const [buildNodes, setBuildNodes] = useState<TreeNode[]>([]);
    const [buildEdges, setBuildEdges] = useState<{ from: number; to: number }[]>([]);
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    const goalNode = nodeCount - 1;

    const [astarState, setAstarState] = useState<AStarState>({
        current: null,
        openSet: [],
        closedSet: new Set(),
        visitOrder: [],
        path: [],
        isRunning: false,
        isComplete: false,
        stepMessage: "Configure settings and click Start to begin A* search",
        activeEdge: null,
        stepType: "INIT",
        goalNode: goalNode,
    });

    const animationRef = useRef<NodeJS.Timeout | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const theme = {
        bg: isDarkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" : "bg-gradient-to-br from-slate-100 to-white text-slate-900",
        panel: isDarkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-300 shadow-lg",
        header: isDarkMode ? "bg-slate-900/95 border-slate-700" : "bg-white border-slate-200 shadow-md",
        input: isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900",
        textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
        textLabel: isDarkMode ? "text-slate-300" : "text-slate-600",
        codeBg: isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200",
        modal: isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200",
    };

    useEffect(() => {
        setNodes(createTreeGraph(nodeCount));
        reset();
    }, [nodeCount]);

    const reset = useCallback(() => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
        setStepHistory([]);
        setNodes(prev => prev.map(n => ({ ...n, gCost: Infinity, hCost: Infinity, fCost: Infinity, parent: null })));
        setAstarState({
            current: null,
            openSet: [],
            closedSet: new Set(),
            visitOrder: [],
            path: [],
            isRunning: false,
            isComplete: false,
            stepMessage: "Configure settings and click Start to begin A* search",
            activeEdge: null,
            stepType: "INIT",
            goalNode: nodeCount - 1,
        });
    }, [nodeCount]);

    // Generate random tree
    const generateRandomTree = () => {
        reset();
        setNodes(createTreeGraph(nodeCount));
        setShowAlert("Random tree generated!");
        setTimeout(() => setShowAlert(null), 2000);
    };

    // Open build graph modal
    const openBuildGraph = () => {
        const buildGraphNodes: TreeNode[] = [];
        const centerX = 350;
        const centerY = 140;
        const radius = 100;

        for (let i = 0; i < nodeCount; i++) {
            const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
            buildGraphNodes.push({
                id: i,
                label: String(i),
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                children: [],
                gCost: Infinity,
                hCost: Infinity,
                fCost: Infinity,
                parent: null,
            });
        }

        setBuildNodes(buildGraphNodes);
        setBuildEdges([]);
        setSelectedNode(null);
        setShowBuildGraph(true);
    };

    const handleBuildNodeClick = (nodeId: number) => {
        if (selectedNode === null) {
            setSelectedNode(nodeId);
        } else if (selectedNode !== nodeId) {
            if (buildEdges.some(e => e.from === selectedNode && e.to === nodeId)) {
                setShowAlert("Edge already exists!");
                setTimeout(() => setShowAlert(null), 2000);
                setSelectedNode(null);
                return;
            }
            setBuildEdges(prev => [...prev, { from: selectedNode, to: nodeId }]);
            setSelectedNode(null);
        } else {
            setSelectedNode(null);
        }
    };

    const applyBuiltGraph = () => {
        if (buildEdges.length === 0) {
            setShowAlert("Please add at least one edge!");
            setTimeout(() => setShowAlert(null), 2000);
            return;
        }

        const newNodes = buildNodes.map(n => ({ ...n, children: [] as number[] }));
        buildEdges.forEach(edge => {
            newNodes[edge.from].children.push(edge.to);
        });

        setNodes(newNodes);
        setShowBuildGraph(false);
        reset();
        setShowAlert("Custom graph applied!");
        setTimeout(() => setShowAlert(null), 2000);
    };

    const stepAStar = useCallback(() => {
        setAstarState(prev => {
            if (prev.isComplete) return prev;

            setStepHistory(h => [...h, {
                ...prev,
                openSet: [...prev.openSet],
                closedSet: new Set(prev.closedSet),
                visitOrder: [...prev.visitOrder],
                path: [...prev.path],
            }]);

            const goal = prev.goalNode;

            // Initialize
            if (prev.openSet.length === 0 && prev.visitOrder.length === 0) {
                const startNode = nodes[0];
                const goalNodeData = nodes[goal];
                const h = heuristics[heuristic](startNode, goalNodeData);

                setNodes(n => {
                    const updated = [...n];
                    updated[0] = { ...updated[0], gCost: 0, hCost: h, fCost: h };
                    return updated;
                });

                return {
                    ...prev,
                    openSet: [0],
                    stepType: "INIT",
                    stepMessage: `Initialize: Start node 0 added to open set with f(0) = g(0) + h(0) = 0 + ${h.toFixed(1)} = ${h.toFixed(1)}`,
                };
            }

            // A* main loop
            if (prev.openSet.length === 0) {
                return {
                    ...prev,
                    isRunning: false,
                    isComplete: true,
                    stepType: "DONE",
                    stepMessage: "No path found - open set is empty!",
                };
            }

            // Select node with minimum f-cost
            let minF = Infinity;
            let currentId = prev.openSet[0];
            prev.openSet.forEach(id => {
                if (nodes[id].fCost < minF) {
                    minF = nodes[id].fCost;
                    currentId = id;
                }
            });

            // Check if goal reached
            if (currentId === goal) {
                // Reconstruct path
                const path: number[] = [];
                let curr: number | null = currentId;
                while (curr !== null) {
                    path.unshift(curr);
                    curr = nodes[curr].parent;
                }

                return {
                    ...prev,
                    current: currentId,
                    openSet: [],
                    path: path,
                    visitOrder: [...prev.visitOrder, currentId],
                    isRunning: false,
                    isComplete: true,
                    stepType: "PATH_FOUND",
                    stepMessage: `🎉 Goal reached! Optimal path found: ${path.join(" → ")} with total cost ${nodes[currentId].gCost}`,
                };
            }

            // Move current from open to closed
            const newOpenSet = prev.openSet.filter(id => id !== currentId);
            const newClosedSet = new Set(prev.closedSet);
            newClosedSet.add(currentId);
            const newVisitOrder = [...prev.visitOrder, currentId];

            // Get neighbors (children in tree)
            const currentNode = nodes[currentId];
            const neighbors = currentNode.children;

            if (neighbors.length === 0) {
                return {
                    ...prev,
                    current: currentId,
                    openSet: newOpenSet,
                    closedSet: newClosedSet,
                    visitOrder: newVisitOrder,
                    stepType: "MARK_CLOSED",
                    stepMessage: `Node ${currentId} has no children (leaf node). Moving to closed set.`,
                };
            }

            // Process first unprocessed neighbor
            let updatedOpenSet = [...newOpenSet];
            let foundNewNeighbor = false;
            let neighborMessage = "";

            for (const neighborId of neighbors) {
                if (newClosedSet.has(neighborId)) continue;

                const tentativeG = currentNode.gCost + 1;
                const neighborNode = nodes[neighborId];

                if (tentativeG < neighborNode.gCost) {
                    const goalNodeData = nodes[goal];
                    const h = heuristics[heuristic](neighborNode, goalNodeData);
                    const f = tentativeG + h;

                    setNodes(n => {
                        const updated = [...n];
                        updated[neighborId] = {
                            ...updated[neighborId],
                            gCost: tentativeG,
                            hCost: h,
                            fCost: f,
                            parent: currentId,
                        };
                        return updated;
                    });

                    if (!updatedOpenSet.includes(neighborId)) {
                        updatedOpenSet.push(neighborId);
                    }

                    foundNewNeighbor = true;
                    neighborMessage += `Node ${neighborId}: g=${tentativeG}, h=${h.toFixed(1)}, f=${f.toFixed(1)}. `;
                }
            }

            return {
                ...prev,
                current: currentId,
                openSet: updatedOpenSet,
                closedSet: newClosedSet,
                visitOrder: newVisitOrder,
                activeEdge: foundNewNeighbor ? { from: currentId, to: neighbors[0] } : null,
                stepType: foundNewNeighbor ? "UPDATE_COSTS" : "MARK_CLOSED",
                stepMessage: foundNewNeighbor
                    ? `Exploring from node ${currentId} (f=${currentNode.fCost.toFixed(1)}): ${neighborMessage}`
                    : `Node ${currentId} processed. f=${currentNode.fCost.toFixed(1)}. Children already in closed set.`,
            };
        });
    }, [nodes, heuristic]);

    useEffect(() => {
        if (astarState.isRunning && !astarState.isComplete) {
            animationRef.current = setTimeout(stepAStar, speed);
        }
        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [astarState.isRunning, astarState.isComplete, astarState.openSet, astarState.closedSet, speed, stepAStar]);

    const startAutoPlay = useCallback(() => {
        if (astarState.isComplete) {
            reset();
            setTimeout(() => setAstarState(prev => ({ ...prev, isRunning: true })), 100);
            return;
        }
        setAstarState(prev => ({ ...prev, isRunning: true }));
    }, [astarState.isComplete, reset]);

    const pause = useCallback(() => {
        setAstarState(prev => ({ ...prev, isRunning: false }));
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const stepForward = useCallback(() => {
        if (astarState.isComplete || astarState.isRunning) return;
        stepAStar();
    }, [astarState.isComplete, astarState.isRunning, stepAStar]);

    const stepBack = useCallback(() => {
        if (stepHistory.length > 0 && !astarState.isRunning) {
            const previousState = stepHistory[stepHistory.length - 1];
            setAstarState({ ...previousState, isRunning: false });
            setStepHistory(prev => prev.slice(0, -1));
        }
    }, [stepHistory, astarState.isRunning]);

    const getNodeColor = (nodeId: number) => {
        if (astarState.path.includes(nodeId) && astarState.isComplete) return "fill-emerald-400 stroke-emerald-500";
        if (astarState.current === nodeId) return "fill-amber-400 stroke-amber-500";
        if (astarState.closedSet.has(nodeId)) return "fill-orange-600 stroke-orange-700";
        if (astarState.openSet.includes(nodeId)) return "fill-yellow-400 stroke-yellow-500";
        if (nodeId === goalNode) return "fill-rose-500 stroke-rose-600";
        return isDarkMode ? "fill-slate-600 stroke-slate-500" : "fill-slate-300 stroke-slate-400";
    };

    return (
        <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-500 ${theme.bg}`}>
            {/* Alert */}
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 border border-slate-600 rounded-lg px-6 py-3 shadow-xl"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <p className="text-white font-medium">{showAlert}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.header
                className={`border-b backdrop-blur-md z-50 flex-shrink-0 ${theme.header}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className={`flex items-center gap-2 hover:opacity-80 ${theme.textMuted}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Back</span>
                        </Link>
                        <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            A* Visualizer
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                        <button onClick={() => setShowTheory(true)} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-all">
                            Theory
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
                {/* Left Panel */}
                <div className="w-72 flex flex-col gap-3">
                    <div className={`rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-4 uppercase tracking-wider ${theme.textLabel}`}>Configuration</h3>

                        <div className="mb-3">
                            <label className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Number of Nodes</label>
                            <select
                                value={nodeCount}
                                onChange={(e) => setNodeCount(parseInt(e.target.value))}
                                disabled={astarState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                {Array.from({ length: 18 }, (_, i) => i + 3).map(n => (
                                    <option key={n} value={n}>{n} nodes</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Heuristic</label>
                            <select
                                value={heuristic}
                                onChange={(e) => { setHeuristic(e.target.value as HeuristicType); reset(); }}
                                disabled={astarState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                <option value="depth">Depth-based</option>
                                <option value="euclidean">Euclidean</option>
                                <option value="manhattan">Manhattan</option>
                            </select>
                            <p className={`text-[10px] mt-1 ${theme.textMuted}`}>{heuristicDescriptions[heuristic]}</p>
                        </div>

                        <div className="mb-3">
                            <label className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Graph Type</label>
                            <select
                                value={graphType}
                                onChange={(e) => { setGraphType(e.target.value as "directed" | "undirected"); reset(); }}
                                disabled={astarState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                <option value="directed">Directed</option>
                                <option value="undirected">Undirected</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${theme.textLabel}`}>Speed</span>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>{speed}ms</span>
                            </div>
                            <input
                                type="range" min="200" max="2000" step="100"
                                value={2200 - speed}
                                onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme.textLabel}`}>Controls</h3>
                        <div className="space-y-2">
                            {!astarState.isRunning ? (
                                <button
                                    onClick={startAutoPlay}
                                    disabled={astarState.isComplete}
                                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm disabled:opacity-50 transition-all"
                                >
                                    Start A*
                                </button>
                            ) : (
                                <button
                                    onClick={pause}
                                    className="w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all"
                                >
                                    Pause
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={stepBack}
                                    disabled={astarState.isRunning || stepHistory.length === 0}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={stepForward}
                                    disabled={astarState.isRunning || astarState.isComplete}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                                >
                                    Next
                                </button>
                            </div>
                            <button
                                onClick={reset}
                                className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-red-800 hover:bg-red-700 text-white transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Goal indicator */}
                    <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className={theme.textLabel}>Goal: Node {goalNode}</span>
                        </div>
                    </div>
                </div>

                {/* Center Panel */}
                <div className="flex-1 flex flex-col gap-3">
                    <div className={`rounded-lg px-4 py-2.5 border ${astarState.isComplete ? (astarState.path.length > 0 ? (isDarkMode ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50') : (isDarkMode ? 'border-red-500/50 bg-red-500/10' : 'border-red-400 bg-red-50')) : (isDarkMode ? 'border-amber-500/50 bg-amber-500/10' : 'border-amber-400 bg-amber-50')}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {astarState.stepMessage}
                        </p>
                    </div>

                    <div className={`flex-1 rounded-xl border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-300'}`}>

                        {/* Algorithm State - Top Left */}
                        <div className={`absolute top-4 left-4 w-60 rounded-lg border z-10 ${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-300 shadow-lg'}`}>
                            <div className={`px-3 py-2 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                                    A* State
                                </h4>
                            </div>
                            <div className="p-3 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${theme.textLabel}`}>Current:</span>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${astarState.current !== null ? 'bg-amber-500 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')}`}>
                                        {astarState.current !== null ? `${astarState.current} (f=${nodes[astarState.current]?.fCost.toFixed(1)})` : "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>
                                        Open Set (by f-cost):
                                    </span>
                                    <div className={`flex flex-wrap gap-1 min-h-[24px] p-1.5 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                                        {astarState.openSet.length > 0 ? (
                                            [...astarState.openSet].sort((a, b) => (nodes[a]?.fCost || 0) - (nodes[b]?.fCost || 0)).map((id, idx) => (
                                                <span key={`${id}-${idx}`} className={`px-1.5 py-0.5 rounded text-white text-xs font-medium ${idx === 0 ? 'bg-yellow-500' : 'bg-orange-500'}`}>
                                                    {id}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">Empty</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Visit Order:</span>
                                    <div className={`p-1.5 rounded border font-mono text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                        {astarState.visitOrder.length > 0 ? astarState.visitOrder.join(" → ") : "-"}
                                    </div>
                                </div>

                                {astarState.path.length > 0 && (
                                    <div>
                                        <span className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Path:</span>
                                        <div className={`p-1.5 rounded border font-mono text-xs ${isDarkMode ? 'bg-emerald-900/50 border-emerald-700 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-700'}`}>
                                            {astarState.path.join(" → ")}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tree SVG */}
                        <svg viewBox="0 0 700 350" className="w-full h-full">
                            {nodes.map(node =>
                                node.children.map(childId => {
                                    const child = nodes.find(n => n.id === childId);
                                    if (!child) return null;
                                    const isActive = astarState.activeEdge?.from === node.id && astarState.activeEdge?.to === childId;
                                    const isPath = astarState.path.includes(node.id) && astarState.path.includes(childId) && 
                                                   Math.abs(astarState.path.indexOf(node.id) - astarState.path.indexOf(childId)) === 1;
                                    const isVisited = astarState.closedSet.has(node.id) && astarState.closedSet.has(childId);

                                    return (
                                        <line
                                            key={`${node.id}-${childId}`}
                                            x1={node.x} y1={node.y + 18}
                                            x2={child.x} y2={child.y - 18}
                                            className={
                                                isPath ? "stroke-emerald-400" :
                                                isActive ? "stroke-rose-500" :
                                                    isVisited ? "stroke-orange-500" :
                                                        isDarkMode ? "stroke-slate-600" : "stroke-slate-400"
                                            }
                                            strokeWidth={isPath ? 3 : isActive ? 2.5 : 1.5}
                                            strokeLinecap="round"
                                            markerEnd={graphType === "directed" ? "url(#arrowhead)" : undefined}
                                        />
                                    );
                                })
                            )}

                            <defs>
                                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                    <polygon points="0 0, 8 3, 0 6" className={isDarkMode ? "fill-slate-500" : "fill-slate-400"} />
                                </marker>
                            </defs>

                            {nodes.map(node => (
                                <g key={node.id}>
                                    <motion.circle
                                        cx={node.x} cy={node.y} r="18"
                                        className={`${getNodeColor(node.id)} transition-colors duration-200`}
                                        strokeWidth="2"
                                        animate={{ scale: astarState.current === node.id ? 1.15 : 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    />
                                    <text
                                        x={node.x} y={node.y}
                                        textAnchor="middle" dominantBaseline="central"
                                        className={`text-xs font-semibold pointer-events-none ${astarState.current === node.id || astarState.closedSet.has(node.id) || astarState.openSet.includes(node.id) || astarState.path.includes(node.id)
                                            ? 'fill-white'
                                            : isDarkMode ? 'fill-white' : 'fill-slate-700'
                                            }`}
                                    >
                                        {node.label}
                                    </text>
                                    {/* f-cost badge */}
                                    {node.fCost !== Infinity && (
                                        <g>
                                            <rect x={node.x + 12} y={node.y - 22} width="24" height="12" rx="3" className="fill-slate-800/80" />
                                            <text x={node.x + 24} y={node.y - 16} textAnchor="middle" dominantBaseline="central" className="fill-amber-300 text-[7px] font-mono">
                                                f={node.fCost.toFixed(0)}
                                            </text>
                                        </g>
                                    )}
                                    {/* Visit order badge */}
                                    {astarState.visitOrder.includes(node.id) && (
                                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                                            <circle cx={node.x - 14} cy={node.y - 14} r="8" className="fill-orange-600" />
                                            <text x={node.x - 14} y={node.y - 14} textAnchor="middle" dominantBaseline="central" className="fill-white text-[8px] font-bold">
                                                {astarState.visitOrder.indexOf(node.id) + 1}
                                            </text>
                                        </motion.g>
                                    )}
                                </g>
                            ))}
                        </svg>

                        <div className={`absolute bottom-3 left-4 flex gap-4 text-xs rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-300'}`}>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className={theme.textLabel}>Current</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className={theme.textLabel}>Open Set</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-600" /><span className={theme.textLabel}>Closed Set</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className={theme.textLabel}>Goal</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span className={theme.textLabel}>Path</span></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-72 flex flex-col">
                    <div className={`flex-1 rounded-xl p-4 border overflow-hidden flex flex-col ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme.textLabel}`}>
                            A* Algorithm
                        </h3>
                        <div className={`flex-1 overflow-y-auto rounded-lg p-3 font-mono text-[11px] leading-relaxed ${theme.codeBg} border`}>
                            {ASTAR_PSEUDOCODE.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    style={{ paddingLeft: `${line.indent * 0.8}rem` }}
                                    className={`py-0.5 px-1.5 rounded transition-all ${stepMap[astarState.stepType]?.includes(line.step)
                                        ? isDarkMode ? 'bg-amber-500/40 text-amber-200' : 'bg-amber-100 text-amber-800'
                                        : theme.textMuted
                                        }`}
                                    animate={{ x: stepMap[astarState.stepType]?.includes(line.step) ? 3 : 0 }}
                                >
                                    {line.text}
                                </motion.div>
                            ))}
                        </div>

                        <div className={`mt-3 p-2.5 rounded-lg border text-[10px] leading-relaxed ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                            A* uses f(n) = g(n) + h(n) to find the optimal path. g(n) is the cost from start, h(n) is the heuristic estimate to goal.
                        </div>
                    </div>
                </div>
            </div>

            {/* Build Graph Modal */}
            <AnimatePresence>
                {showBuildGraph && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className={`rounded-2xl max-w-3xl w-full border shadow-2xl ${theme.modal}`} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Build Graph Manually</h2>
                                <button onClick={() => setShowBuildGraph(false)} className={`hover:text-red-400 text-2xl ${theme.textMuted}`}>×</button>
                            </div>

                            <div className={`px-6 py-2 text-sm border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                                Click a node to select it (yellow), then click another node to create an edge.
                            </div>

                            <div className={`relative mx-4 my-4 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`} style={{ height: '280px' }}>
                                <svg viewBox="0 0 700 280" className="w-full h-full">
                                    {buildEdges.map((edge, idx) => {
                                        const fromNode = buildNodes.find(n => n.id === edge.from);
                                        const toNode = buildNodes.find(n => n.id === edge.to);
                                        if (!fromNode || !toNode) return null;
                                        return (
                                            <line key={idx} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} className="stroke-slate-500 stroke-[2]" markerEnd="url(#build-arrow)" />
                                        );
                                    })}
                                    <defs>
                                        <marker id="build-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" className="fill-slate-500" />
                                        </marker>
                                    </defs>
                                    {buildNodes.map(node => (
                                        <g key={node.id} onClick={() => handleBuildNodeClick(node.id)} className="cursor-pointer">
                                            <circle cx={node.x} cy={node.y} r="22" className={`${selectedNode === node.id ? 'fill-yellow-400 stroke-yellow-300' : node.id === 0 ? 'fill-emerald-500 stroke-emerald-400' : node.id === nodeCount - 1 ? 'fill-rose-500 stroke-rose-400' : 'fill-slate-600 stroke-slate-400'} hover:fill-slate-500 transition-colors`} strokeWidth="3" />
                                            <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" className="text-sm font-bold pointer-events-none fill-white">{node.label}</text>
                                        </g>
                                    ))}
                                </svg>
                            </div>

                            <div className="flex justify-between px-6 py-4 border-t border-slate-700">
                                <button onClick={() => setShowBuildGraph(false)} className={`px-5 py-2 rounded-lg border font-medium ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                                <button onClick={applyBuiltGraph} className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold">Apply Graph</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theory Modal */}
            <AnimatePresence>
                {showTheory && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTheory(false)}>
                        <motion.div className={`rounded-2xl p-6 max-w-2xl w-full border shadow-2xl ${theme.modal}`} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">A* Search Algorithm</h2>
                                    <p className={`text-xs mt-1 font-medium tracking-widest uppercase ${theme.textMuted}`}>Algorithm Fundamentals</p>
                                </div>
                                <button onClick={() => setShowTheory(false)} className={`p-2 rounded-full hover:bg-red-500/10 ${theme.textMuted} hover:text-red-400`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className={`space-y-5 text-sm max-h-[65vh] overflow-y-auto pr-2 ${theme.textLabel}`}>
                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-amber-500 rounded-full" /> What is A*?
                                    </h3>
                                    <p className="leading-relaxed">A* (A-star) is an informed search algorithm that finds the shortest path between nodes. It uses a heuristic function to estimate the cost to reach the goal, making it more efficient than uninformed search algorithms like BFS or DFS.</p>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-orange-500 rounded-full" /> The f(n) = g(n) + h(n) Formula
                                    </h3>
                                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li><strong className="text-amber-400">f(n)</strong>: Total estimated cost of path through node n</li>
                                            <li><strong className="text-emerald-400">g(n)</strong>: Actual cost from start to node n</li>
                                            <li><strong className="text-rose-400">h(n)</strong>: Heuristic estimate from n to goal</li>
                                            <li>A* always expands the node with the lowest f(n) first</li>
                                        </ul>
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Complexity
                                    </h3>
                                    <div className={`grid grid-cols-2 gap-3`}>
                                        <div className={`p-3 rounded-lg border text-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <p className="text-xs font-medium mb-1">Time Complexity</p>
                                            <p className="font-mono text-amber-400 font-bold">O(E log V)</p>
                                        </div>
                                        <div className={`p-3 rounded-lg border text-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <p className="text-xs font-medium mb-1">Space Complexity</p>
                                            <p className="font-mono text-amber-400 font-bold">O(V)</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-rose-500 rounded-full" /> Use Cases
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>GPS and navigation systems</li>
                                        <li>Video game pathfinding</li>
                                        <li>Robotics motion planning</li>
                                        <li>Network routing</li>
                                        <li>Puzzle solving (8-puzzle, etc.)</li>
                                    </ul>
                                </section>
                            </div>

                            <button onClick={() => setShowTheory(false)} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-amber-500/20">
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
