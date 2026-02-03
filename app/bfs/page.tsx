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
}

type StepType =
    | "INIT"
    | "DEQUEUE"
    | "CHECK_VISITED"
    | "MARK_VISITED"
    | "EXPLORE_CHILD"
    | "ENQUEUE_CHILD"
    | "DONE";

interface BFSState {
    current: number | null;
    visited: Set<number>;
    queue: number[];
    visitOrder: number[];
    isRunning: boolean;
    isComplete: boolean;
    stepMessage: string;
    activeEdge: { from: number; to: number } | null;
    stepType: StepType;
    pendingChildren: number[];
    parentNode: number | null;
    currentLevel: number;
}

// Pseudocode for BFS
const BFS_PSEUDOCODE = [
    { text: "BFS(root):", indent: 0, step: 0 },
    { text: "queue.enqueue(root)", indent: 1, step: 1 },
    { text: "while queue not empty:", indent: 1, step: 2 },
    { text: "node = queue.dequeue()", indent: 2, step: 3 },
    { text: "if visited[node]: continue", indent: 2, step: 4 },
    { text: "visited[node] = true", indent: 2, step: 5 },
    { text: "process(node)", indent: 2, step: 6 },
    { text: "for child in node.children:", indent: 2, step: 7 },
    { text: "queue.enqueue(child)", indent: 3, step: 8 },
];

const stepMap: Record<StepType, number[]> = {
    INIT: [0, 1],
    DEQUEUE: [2, 3],
    CHECK_VISITED: [4],
    MARK_VISITED: [5, 6],
    EXPLORE_CHILD: [7],
    ENQUEUE_CHILD: [8],
    DONE: [2],
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

    // Root layer
    layers.push([nodeId++]);
    remaining--;

    // Create subsequent layers with balanced distribution
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

    // Position nodes
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
            });
        });
    });

    // Connect layers (parent to children)
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

// Calculate level for each node (for level-by-level display)
const calculateNodeLevels = (nodes: TreeNode[]): Map<number, number> => {
    const levels = new Map<number, number>();
    if (nodes.length === 0) return levels;

    levels.set(0, 0);
    const queue = [0];

    while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        const currentLevel = levels.get(nodeId) ?? 0;
        for (const childId of node.children) {
            if (!levels.has(childId)) {
                levels.set(childId, currentLevel + 1);
                queue.push(childId);
            }
        }
    }

    return levels;
};

export default function BFSPage() {
    const [nodeCount, setNodeCount] = useState(8);
    const [graphType, setGraphType] = useState<"directed" | "undirected">("directed");

    const [nodes, setNodes] = useState<TreeNode[]>([]);
    const [nodeLevels, setNodeLevels] = useState<Map<number, number>>(new Map());
    const [speed, setSpeed] = useState(800);
    const [showTheory, setShowTheory] = useState(false);
    const [showBuildGraph, setShowBuildGraph] = useState(false);
    const [showAlert, setShowAlert] = useState<string | null>(null);
    const [stepHistory, setStepHistory] = useState<BFSState[]>([]);

    // Build graph state
    const [buildNodes, setBuildNodes] = useState<TreeNode[]>([]);
    const [buildEdges, setBuildEdges] = useState<{ from: number; to: number }[]>([]);
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    const [bfsState, setBfsState] = useState<BFSState>({
        current: null,
        visited: new Set(),
        queue: [],
        visitOrder: [],
        isRunning: false,
        isComplete: false,
        stepMessage: "Configure settings and click Start to begin",
        activeEdge: null,
        stepType: "INIT",
        pendingChildren: [],
        parentNode: null,
        currentLevel: 0,
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
        const newNodes = createTreeGraph(nodeCount);
        setNodes(newNodes);
        setNodeLevels(calculateNodeLevels(newNodes));
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeCount]);

    const reset = useCallback(() => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
        setStepHistory([]);
        setBfsState({
            current: null,
            visited: new Set(),
            queue: [],
            visitOrder: [],
            isRunning: false,
            isComplete: false,
            stepMessage: "Configure settings and click Start to begin",
            activeEdge: null,
            stepType: "INIT",
            pendingChildren: [],
            parentNode: null,
            currentLevel: 0,
        });
    }, []);

    // Generate random tree
    const generateRandomTree = useCallback(() => {
        reset();
        const newNodes = createTreeGraph(nodeCount);
        setNodes(newNodes);
        setNodeLevels(calculateNodeLevels(newNodes));
        setShowAlert("Random tree generated!");
        setTimeout(() => setShowAlert(null), 2000);
    }, [nodeCount, reset]);

    // Open build graph modal
    const openBuildGraph = useCallback(() => {
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
            });
        }

        setBuildNodes(buildGraphNodes);
        setBuildEdges([]);
        setSelectedNode(null);
        setShowBuildGraph(true);
    }, [nodeCount]);

    const handleBuildNodeClick = useCallback((nodeId: number) => {
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
    }, [selectedNode, buildEdges]);

    const removeLastEdge = useCallback(() => {
        if (buildEdges.length > 0) {
            setBuildEdges(prev => prev.slice(0, -1));
        }
    }, [buildEdges.length]);

    const clearAllEdges = useCallback(() => {
        setBuildEdges([]);
        setSelectedNode(null);
    }, []);

    const applyBuiltGraph = useCallback(() => {
        if (buildEdges.length === 0) {
            setShowAlert("Please add at least one edge!");
            setTimeout(() => setShowAlert(null), 2000);
            return;
        }

        // Convert edges to tree structure
        const newNodes = buildNodes.map(n => ({ ...n, children: [] as number[] }));
        buildEdges.forEach(edge => {
            newNodes[edge.from].children.push(edge.to);
        });

        // Reposition nodes based on BFS levels from node 0
        const levels = calculateNodeLevels(newNodes);
        const width = 480;
        const layerHeight = 70;
        const startY = 50;
        const offsetX = 180;

        // Group nodes by level
        const nodesByLevel: Map<number, number[]> = new Map();
        levels.forEach((level, nodeId) => {
            if (!nodesByLevel.has(level)) {
                nodesByLevel.set(level, []);
            }
            nodesByLevel.get(level)!.push(nodeId);
        });

        // Position nodes at each level
        nodesByLevel.forEach((nodesAtLevel, level) => {
            const y = startY + level * layerHeight;
            const spacing = width / (nodesAtLevel.length + 1);
            nodesAtLevel.forEach((nodeId, idx) => {
                newNodes[nodeId].x = offsetX + spacing * (idx + 1);
                newNodes[nodeId].y = y;
            });
        });

        // Handle disconnected nodes (place them at bottom)
        newNodes.forEach((node, idx) => {
            if (!levels.has(idx)) {
                const maxLevel = Math.max(...Array.from(levels.values()), 0);
                node.y = startY + (maxLevel + 1) * layerHeight;
            }
        });

        setNodes(newNodes);
        setNodeLevels(levels);
        setShowBuildGraph(false);
        reset();
        setShowAlert("Custom graph applied!");
        setTimeout(() => setShowAlert(null), 2000);
    }, [buildNodes, buildEdges, reset]);

    const stepBFS = useCallback(() => {
        setBfsState(prev => {
            if (prev.isComplete) return prev;

            // Save current state to history
            setStepHistory(h => [...h, {
                ...prev,
                visited: new Set(prev.visited),
                queue: [...prev.queue],
                visitOrder: [...prev.visitOrder],
                pendingChildren: [...prev.pendingChildren],
            }]);

            // Process pending children first (enqueue them one by one for visualization)
            if (prev.pendingChildren.length > 0) {
                const children = [...prev.pendingChildren];
                const child = children.shift()!;

                // Check if already visited or in queue
                if (prev.visited.has(child) || prev.queue.includes(child)) {
                    return {
                        ...prev,
                        pendingChildren: children,
                        activeEdge: { from: prev.current!, to: child },
                        stepType: "CHECK_VISITED",
                        stepMessage: prev.visited.has(child)
                            ? `Child ${child} already visited, skipping`
                            : `Child ${child} already in queue, skipping`
                    };
                }

                // Enqueue the child
                const newQueue = [...prev.queue, child];

                return {
                    ...prev,
                    queue: newQueue,
                    pendingChildren: children,
                    activeEdge: { from: prev.current!, to: child },
                    stepType: "ENQUEUE_CHILD",
                    stepMessage: `Enqueue node ${child} to the back of queue`
                };
            }

            // If queue is empty
            if (prev.queue.length === 0) {
                // Initialize: add root to queue
                if (prev.visitOrder.length === 0) {
                    return {
                        ...prev,
                        queue: [0],
                        stepType: "INIT",
                        stepMessage: "Starting BFS: Enqueue root node 0"
                    };
                }
                // BFS complete
                return {
                    ...prev,
                    isRunning: false,
                    isComplete: true,
                    current: null,
                    activeEdge: null,
                    stepType: "DONE",
                    stepMessage: `BFS Complete! Visit order: ${prev.visitOrder.join(" → ")}`
                };
            }

            // Dequeue the front node (FIFO)
            const queue = [...prev.queue];
            const nodeId = queue.shift()!;
            const node = nodes.find(n => n.id === nodeId);

            // Check if already visited
            if (prev.visited.has(nodeId)) {
                return {
                    ...prev,
                    queue,
                    activeEdge: null,
                    stepType: "CHECK_VISITED",
                    stepMessage: `Node ${nodeId} already visited, skipping`
                };
            }

            // Mark as visited
            const newVisited = new Set(prev.visited);
            newVisited.add(nodeId);
            const newVisitOrder = [...prev.visitOrder, nodeId];
            const children = node ? [...node.children] : [];
            const nodeLevel = nodeLevels.get(nodeId) ?? 0;

            return {
                ...prev,
                current: nodeId,
                visited: newVisited,
                visitOrder: newVisitOrder,
                queue,
                pendingChildren: children,
                parentNode: prev.current,
                activeEdge: null,
                stepType: "MARK_VISITED",
                currentLevel: nodeLevel,
                stepMessage: `Visiting node ${nodeId} (Level ${nodeLevel})${children.length > 0 ? ` - has ${children.length} children to explore` : " - leaf node"}`
            };
        });
    }, [nodes, nodeLevels]);

    useEffect(() => {
        if (bfsState.isRunning && !bfsState.isComplete) {
            animationRef.current = setTimeout(stepBFS, speed);
        }
        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [bfsState.isRunning, bfsState.isComplete, bfsState.visited, bfsState.queue, bfsState.pendingChildren, speed, stepBFS]);

    const startAutoPlay = useCallback(() => {
        if (bfsState.isComplete) {
            reset();
            setTimeout(() => setBfsState(prev => ({ ...prev, isRunning: true })), 100);
            return;
        }
        setBfsState(prev => ({ ...prev, isRunning: true }));
    }, [bfsState.isComplete, reset]);

    const pause = useCallback(() => {
        setBfsState(prev => ({ ...prev, isRunning: false }));
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const stepForward = useCallback(() => {
        if (bfsState.isComplete || bfsState.isRunning) return;
        stepBFS();
    }, [bfsState.isComplete, bfsState.isRunning, stepBFS]);

    const stepBack = useCallback(() => {
        if (stepHistory.length > 0 && !bfsState.isRunning) {
            const previousState = stepHistory[stepHistory.length - 1];
            setBfsState({ ...previousState, isRunning: false });
            setStepHistory(prev => prev.slice(0, -1));
        }
    }, [stepHistory, bfsState.isRunning]);

    const getNodeColor = useCallback((nodeId: number) => {
        if (bfsState.current === nodeId) return "fill-amber-400 stroke-amber-500";
        if (bfsState.visited.has(nodeId)) return "fill-emerald-500 stroke-emerald-600";
        if (bfsState.queue.includes(nodeId)) return "fill-cyan-500 stroke-cyan-600";
        return isDarkMode ? "fill-slate-600 stroke-slate-500" : "fill-slate-300 stroke-slate-400";
    }, [bfsState.current, bfsState.visited, bfsState.queue, isDarkMode]);

    return (
        <div className={`min-h-screen lg:h-screen flex flex-col lg:overflow-hidden transition-colors duration-500 ${theme.bg}`}>
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
                <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Link href="/" className={`flex items-center gap-1 lg:gap-2 hover:opacity-80 ${theme.textMuted}`}>
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium text-sm lg:text-base">Back</span>
                        </Link>
                        <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                        <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent truncate">
                            BFS Visualizer
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 lg:p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
                            {isDarkMode ? (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>
                        <button onClick={() => setShowTheory(true)} className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs lg:text-sm font-semibold transition-all">
                            Theory
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto lg:overflow-hidden">
                {/* Left Panel */}
                <div className="w-full lg:w-72 flex flex-col gap-3 flex-shrink-0">
                    <div className={`rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-4 uppercase tracking-wider ${theme.textLabel}`}>Configuration</h3>

                        <div className="mb-3">
                            <label className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Number of Nodes</label>
                            <select
                                value={nodeCount}
                                onChange={(e) => setNodeCount(parseInt(e.target.value))}
                                disabled={bfsState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                {Array.from({ length: 18 }, (_, i) => i + 3).map(n => (
                                    <option key={n} value={n}>{n} nodes</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Graph Type</label>
                            <select
                                value={graphType}
                                onChange={(e) => { setGraphType(e.target.value as "directed" | "undirected"); reset(); }}
                                disabled={bfsState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                <option value="directed">Directed</option>
                                <option value="undirected">Undirected</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${theme.textLabel}`}>Speed</span>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>{speed}ms</span>
                            </div>
                            <input
                                type="range" min="200" max="2000" step="100"
                                value={2200 - speed}
                                onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme.textLabel}`}>Controls</h3>
                        <div className="space-y-2">
                            {!bfsState.isRunning ? (
                                <button
                                    onClick={startAutoPlay}
                                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all"
                                >
                                    {bfsState.isComplete ? "Restart BFS" : "Start BFS"}
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
                                    disabled={bfsState.isRunning || stepHistory.length === 0}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                                >
                                    ◀ Back
                                </button>
                                <button
                                    onClick={stepForward}
                                    disabled={bfsState.isRunning || bfsState.isComplete}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                                >
                                    Next ▶
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={reset}
                                    disabled={bfsState.isRunning}
                                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-700 hover:bg-red-600 text-white transition-all disabled:opacity-50"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={generateRandomTree}
                                    disabled={bfsState.isRunning}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                                >
                                    Random
                                </button>
                            </div>
                            <button
                                onClick={openBuildGraph}
                                disabled={bfsState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${isDarkMode ? 'bg-cyan-700 hover:bg-cyan-600 text-white' : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800'}`}
                            >
                                Build Custom Graph
                            </button>
                        </div>
                    </div>

                    {/* Level indicator */}
                    <div className={`rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-2 uppercase tracking-wider ${theme.textLabel}`}>Current Level</h3>
                        <div className={`text-2xl lg:text-3xl font-bold text-center py-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            {bfsState.visitOrder.length > 0 ? bfsState.currentLevel : "-"}
                        </div>
                        <p className={`text-[10px] text-center ${theme.textMuted}`}>
                            BFS explores level by level
                        </p>
                    </div>
                </div>

                {/* Center Panel */}
                <div className="flex-1 flex flex-col gap-3 min-h-[500px] lg:min-h-0">
                    <div className={`rounded-lg px-4 py-2.5 border ${bfsState.isComplete ? (isDarkMode ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50') : (isDarkMode ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-cyan-400 bg-cyan-50')}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {bfsState.stepMessage}
                        </p>
                    </div>

                    <div className={`flex-1 rounded-xl border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-300'}`}>

                        {/* Algorithm State - Overlay on Desktop, Stays on top of SVG */}
                        <div className={`absolute top-2 left-2 lg:top-4 lg:left-4 w-[calc(100%-1rem)] lg:w-64 rounded-lg border z-10 transition-all ${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-300 shadow-lg'}`}>
                            <div className={`px-3 py-1.5 lg:py-2 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                <h4 className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                    Queue State (FIFO)
                                </h4>
                            </div>
                            <div className="p-2 lg:p-3 space-y-2 lg:space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] lg:text-xs font-medium ${theme.textLabel}`}>Current:</span>
                                    <span className={`text-xs lg:text-sm font-bold px-2 py-0.5 rounded ${bfsState.current !== null ? 'bg-amber-500 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')}`}>
                                        {bfsState.current !== null ? bfsState.current : "-"}
                                    </span>
                                </div>

                                <div className="hidden lg:block">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium ${theme.textLabel}`}>Queue:</span>
                                        <span className={`text-[10px] ${theme.textMuted}`}>Front → Back</span>
                                    </div>
                                    <div className={`flex flex-wrap gap-1 min-h-[28px] p-1.5 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                                        {bfsState.queue.length > 0 ? (
                                            bfsState.queue.map((id, idx) => (
                                                <span
                                                    key={`${id}-${idx}`}
                                                    className={`px-1.5 py-0.5 rounded text-white text-xs font-medium ${idx === 0 ? 'bg-amber-500' : 'bg-cyan-600'}`}
                                                >
                                                    {id}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">Empty</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className={`text-[10px] lg:text-xs font-medium block mb-0.5 lg:mb-1 ${theme.textLabel}`}>Visit Order:</span>
                                    <div className={`p-1 lg:p-1.5 rounded border font-mono text-[9px] lg:text-xs min-h-[24px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                        {bfsState.visitOrder.length > 0 ? bfsState.visitOrder.join(" → ") : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tree SVG */}
                        <div className="w-full h-full flex items-center justify-center pt-20 lg:pt-0">
                            <svg viewBox="0 0 700 350" className="w-full h-auto max-h-full">
                                {/* Edges */}
                                {nodes.map(node =>
                                    node.children.map(childId => {
                                        const child = nodes.find(n => n.id === childId);
                                        if (!child) return null;
                                        const isActive = bfsState.activeEdge?.from === node.id && bfsState.activeEdge?.to === childId;
                                        const isVisited = bfsState.visited.has(node.id) && bfsState.visited.has(childId);

                                        return (
                                            <line
                                                key={`${node.id}-${childId}`}
                                                x1={node.x} y1={node.y + 18}
                                                x2={child.x} y2={child.y - 18}
                                                className={
                                                    isActive ? "stroke-rose-500" :
                                                        isVisited ? "stroke-emerald-500" :
                                                            isDarkMode ? "stroke-slate-600" : "stroke-slate-400"
                                                }
                                                strokeWidth={isActive ? 2.5 : 1.5}
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

                                {/* Nodes */}
                                {nodes.map(node => (
                                    <g key={node.id}>
                                        <motion.circle
                                            cx={node.x} cy={node.y} r="18"
                                            className={`${getNodeColor(node.id)} transition-colors duration-200`}
                                            strokeWidth="2"
                                            animate={{ scale: bfsState.current === node.id ? 1.15 : 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        />
                                        <text
                                            x={node.x} y={node.y}
                                            textAnchor="middle" dominantBaseline="central"
                                            className={`text-xs font-semibold pointer-events-none ${bfsState.current === node.id || bfsState.visited.has(node.id) || bfsState.queue.includes(node.id)
                                                ? 'fill-white'
                                                : isDarkMode ? 'fill-white' : 'fill-slate-700'
                                                }`}
                                        >
                                            {node.label}
                                        </text>
                                        {/* Visit order badge */}
                                        {bfsState.visited.has(node.id) && (
                                            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                                                <circle cx={node.x + 14} cy={node.y - 14} r="8" className="fill-emerald-600" />
                                                <text x={node.x + 14} y={node.y - 14} textAnchor="middle" dominantBaseline="central" className="fill-white text-[8px] font-bold">
                                                    {bfsState.visitOrder.indexOf(node.id) + 1}
                                                </text>
                                            </motion.g>
                                        )}
                                        {/* Level indicator */}
                                        {nodeLevels.has(node.id) && (
                                            <text
                                                x={node.x - 14} y={node.y - 14}
                                                textAnchor="middle" dominantBaseline="central"
                                                className={`text-[8px] font-medium ${isDarkMode ? 'fill-slate-500' : 'fill-slate-400'}`}
                                            >
                                                L{nodeLevels.get(node.id)}
                                            </text>
                                        )}
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className={`absolute bottom-2 left-2 lg:bottom-3 lg:left-4 flex flex-wrap gap-2 lg:gap-4 text-[9px] lg:text-xs rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border z-10 ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-300'}`}>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className={theme.textLabel}>Current</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-cyan-500" /><span className={theme.textLabel}>In Queue</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className={theme.textLabel}>Visited</span></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full lg:w-72 flex flex-col flex-shrink-0">
                    <div className={`flex-1 rounded-xl p-4 border overflow-hidden flex flex-col ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme.textLabel}`}>
                            BFS Algorithm
                        </h3>
                        <div className={`flex-1 min-h-[300px] lg:min-h-0 overflow-y-auto rounded-lg p-3 font-mono text-[11px] leading-relaxed ${theme.codeBg} border`}>
                            {BFS_PSEUDOCODE.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    style={{ paddingLeft: `${line.indent * 0.8}rem` }}
                                    className={`py-0.5 px-1.5 rounded transition-all ${stepMap[bfsState.stepType]?.includes(line.step)
                                        ? isDarkMode ? 'bg-cyan-500/40 text-cyan-200' : 'bg-cyan-100 text-cyan-800'
                                        : theme.textMuted
                                        }`}
                                    animate={{ x: stepMap[bfsState.stepType]?.includes(line.step) ? 3 : 0 }}
                                >
                                    {line.text}
                                </motion.div>
                            ))}
                        </div>

                        <div className={`mt-3 p-2.5 rounded-lg border text-[10px] leading-relaxed ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-800'}`}>
                            BFS uses a <strong>Queue (FIFO)</strong> to explore all neighbors at the current depth before moving to nodes at the next depth level.
                        </div>
                    </div>

                    {/* Key Difference from DFS */}
                    <div className={`mt-3 rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-2 uppercase tracking-wider ${theme.textLabel}`}>BFS vs DFS</h3>
                        <div className="space-y-2 text-xs">
                            <div className={`flex items-start gap-2 ${theme.textLabel}`}>
                                <span className="text-cyan-400 font-bold">BFS:</span>
                                <span>Queue (FIFO) - Level by level</span>
                            </div>
                            <div className={`flex items-start gap-2 ${theme.textLabel}`}>
                                <span className="text-violet-400 font-bold">DFS:</span>
                                <span>Stack (LIFO) - Deep first</span>
                            </div>
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
                                Click a node to select it (yellow), then click another node to create an edge. Node 0 is the starting node for BFS.
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
                                            <circle cx={node.x} cy={node.y} r="22" className={`${selectedNode === node.id ? 'fill-yellow-400 stroke-yellow-300' : node.id === 0 ? 'fill-cyan-600 stroke-cyan-400' : 'fill-slate-600 stroke-slate-400'} hover:fill-slate-500 transition-colors`} strokeWidth="3" />
                                            <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" className="text-sm font-bold pointer-events-none fill-white">{node.label}</text>
                                        </g>
                                    ))}
                                </svg>
                            </div>

                            <div className={`px-6 py-2 text-xs border-t ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
                                Edges: {buildEdges.length} | Selected: {selectedNode !== null ? `Node ${selectedNode}` : "None"}
                            </div>

                            <div className="flex justify-between px-6 py-4 border-t border-slate-700">
                                <div className="flex gap-2">
                                    <button onClick={() => setShowBuildGraph(false)} className={`px-5 py-2 rounded-lg border font-medium ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                                    <button onClick={removeLastEdge} disabled={buildEdges.length === 0} className={`px-4 py-2 rounded-lg font-medium disabled:opacity-40 ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Undo</button>
                                    <button onClick={clearAllEdges} disabled={buildEdges.length === 0} className={`px-4 py-2 rounded-lg font-medium disabled:opacity-40 ${isDarkMode ? 'bg-red-800 text-white hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Clear</button>
                                </div>
                                <button onClick={applyBuiltGraph} className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold">Apply Graph</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theory Modal */}
            <AnimatePresence>
                {showTheory && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTheory(false)}>
                        <motion.div className={`rounded-2xl p-6 max-w-2xl w-full border shadow-2xl max-h-[90vh] overflow-hidden flex flex-col ${theme.modal}`} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-6 flex-shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Breadth-First Search</h2>
                                    <p className={`text-xs mt-1 font-medium tracking-widest uppercase ${theme.textMuted}`}>Algorithm Fundamentals</p>
                                </div>
                                <button onClick={() => setShowTheory(false)} className={`p-2 rounded-full hover:bg-red-500/10 ${theme.textMuted} hover:text-red-400`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className={`space-y-5 text-sm overflow-y-auto pr-2 flex-1 ${theme.textLabel}`}>
                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-cyan-500 rounded-full" /> What is BFS?
                                    </h3>
                                    <p className="leading-relaxed">Breadth-First Search is a graph traversal algorithm that explores all vertices at the present depth level before moving on to vertices at the next depth level. It goes "wide" before going "deep".</p>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" /> How It Works
                                    </h3>
                                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className="mb-2">Uses a <strong className="text-cyan-400">Queue</strong> data structure (First-In-First-Out).</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Enqueue the starting node</li>
                                            <li>Dequeue a node from the front, mark it visited</li>
                                            <li>Enqueue all unvisited neighbors to the back</li>
                                            <li>Repeat until queue is empty</li>
                                            <li>This ensures level-by-level exploration</li>
                                        </ul>
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-purple-500 rounded-full" /> Key Properties
                                    </h3>
                                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li><strong>Shortest Path:</strong> BFS finds the shortest path in unweighted graphs</li>
                                            <li><strong>Level Order:</strong> Visits nodes level by level from the source</li>
                                            <li><strong>Complete:</strong> Will find a solution if one exists</li>
                                            <li><strong>Memory:</strong> May require more memory than DFS for wide graphs</li>
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
                                            <p className="font-mono text-cyan-400 font-bold">O(V + E)</p>
                                        </div>
                                        <div className={`p-3 rounded-lg border text-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <p className="text-xs font-medium mb-1">Space Complexity</p>
                                            <p className="font-mono text-cyan-400 font-bold">O(V)</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-amber-500 rounded-full" /> Use Cases
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Shortest path in unweighted graphs</li>
                                        <li>Level-order traversal of trees</li>
                                        <li>Finding connected components</li>
                                        <li>Web crawlers</li>
                                        <li>Social network analysis (degrees of separation)</li>
                                        <li>GPS navigation systems</li>
                                        <li>Peer-to-peer networks</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-rose-500 rounded-full" /> BFS vs DFS
                                    </h3>
                                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="font-bold text-cyan-400 mb-1">BFS</p>
                                                <ul className="list-disc list-inside space-y-0.5">
                                                    <li>Uses Queue (FIFO)</li>
                                                    <li>Level by level</li>
                                                    <li>Finds shortest path</li>
                                                    <li>More memory for wide graphs</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-bold text-violet-400 mb-1">DFS</p>
                                                <ul className="list-disc list-inside space-y-0.5">
                                                    <li>Uses Stack (LIFO)</li>
                                                    <li>Depth first</li>
                                                    <li>May not find shortest</li>
                                                    <li>Less memory typically</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <button onClick={() => setShowTheory(false)} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/20 flex-shrink-0">
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
