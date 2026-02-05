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
    | "POP_STACK"
    | "CHECK_VISITED"
    | "MARK_VISITED"
    | "EXPLORE_CHILD"
    | "PUSH_CHILD"
    | "BACKTRACK"
    | "CALL_RECURSIVE"
    | "DONE";

interface DFSState {
    current: number | null;
    visited: Set<number>;
    stack: number[];
    visitOrder: number[];
    isRunning: boolean;
    isComplete: boolean;
    stepMessage: string;
    activeEdge: { from: number; to: number } | null;
    stepType: StepType;
    pendingChildren: number[];
    parentNode: number | null;
    recursionDepth: number;
}

// Pseudocode for Stack-based DFS
const STACK_PSEUDOCODE = [
    { text: "DFS_Stack(root):", indent: 0, step: 0 },
    { text: "stack.push(root)", indent: 1, step: 1 },
    { text: "while stack not empty:", indent: 1, step: 2 },
    { text: "node = stack.pop()", indent: 2, step: 3 },
    { text: "if visited[node]: continue", indent: 2, step: 4 },
    { text: "visited[node] = true", indent: 2, step: 5 },
    { text: "for child in node.children:", indent: 2, step: 6 },
    { text: "stack.push(child)", indent: 3, step: 7 },
];

// Pseudocode for Recursive DFS
const RECURSIVE_PSEUDOCODE = [
    { text: "DFS_Recursive(node):", indent: 0, step: 0 },
    { text: "if visited[node]: return", indent: 1, step: 1 },
    { text: "visited[node] = true", indent: 1, step: 2 },
    { text: "process(node)", indent: 1, step: 3 },
    { text: "for child in node.children:", indent: 1, step: 4 },
    { text: "DFS_Recursive(child)", indent: 2, step: 5 },
];

const stackStepMap: Record<StepType, number[]> = {
    INIT: [0, 1],
    POP_STACK: [2, 3],
    CHECK_VISITED: [4],
    MARK_VISITED: [5],
    EXPLORE_CHILD: [6],
    PUSH_CHILD: [7],
    BACKTRACK: [2],
    CALL_RECURSIVE: [5],
    DONE: [2],
};

const recursiveStepMap: Record<StepType, number[]> = {
    INIT: [0],
    POP_STACK: [0],
    CHECK_VISITED: [1],
    MARK_VISITED: [2, 3],
    EXPLORE_CHILD: [4],
    PUSH_CHILD: [4],
    BACKTRACK: [4],
    CALL_RECURSIVE: [5],
    DONE: [0],
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

export default function DFSPage() {
    const [nodeCount, setNodeCount] = useState(8);
    const [graphType, setGraphType] = useState<"directed" | "undirected">("directed");
    const [traversalType, setTraversalType] = useState<"stack" | "recursion">("stack");

    const [nodes, setNodes] = useState<TreeNode[]>([]);
    const [speed, setSpeed] = useState(800);
    const [showTheory, setShowTheory] = useState(false);
    const [showBuildGraph, setShowBuildGraph] = useState(false);
    const [showAlert, setShowAlert] = useState<string | null>(null);
    const [stepHistory, setStepHistory] = useState<DFSState[]>([]);

    // Build graph state
    const [buildNodes, setBuildNodes] = useState<TreeNode[]>([]);
    const [buildEdges, setBuildEdges] = useState<{ from: number; to: number }[]>([]);
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    const [dfsState, setDfsState] = useState<DFSState>({
        current: null,
        visited: new Set(),
        stack: [],
        visitOrder: [],
        isRunning: false,
        isComplete: false,
        stepMessage: "Configure settings and click Start to begin",
        activeEdge: null,
        stepType: "INIT",
        pendingChildren: [],
        parentNode: null,
        recursionDepth: 0,
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
        setDfsState({
            current: null,
            visited: new Set(),
            stack: [],
            visitOrder: [],
            isRunning: false,
            isComplete: false,
            stepMessage: "Configure settings and click Start to begin",
            activeEdge: null,
            stepType: "INIT",
            pendingChildren: [],
            parentNode: null,
            recursionDepth: 0,
        });
    }, []);

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

        // Convert edges to tree structure
        const newNodes = buildNodes.map(n => ({ ...n, children: [] as number[] }));
        buildEdges.forEach(edge => {
            newNodes[edge.from].children.push(edge.to);
        });

        setNodes(newNodes);
        setShowBuildGraph(false);
        reset();
        setShowAlert("Custom tree applied!");
        setTimeout(() => setShowAlert(null), 2000);
    };

    const stepDFS = useCallback(() => {
        setDfsState(prev => {
            if (prev.isComplete) return prev;

            setStepHistory(h => [...h, {
                ...prev,
                visited: new Set(prev.visited),
                stack: [...prev.stack],
                visitOrder: [...prev.visitOrder],
                pendingChildren: [...prev.pendingChildren],
            }]);

            const isRecursive = traversalType === "recursion";

            if (prev.pendingChildren.length > 0) {
                const children = [...prev.pendingChildren];
                const child = children.shift()!;

                if (prev.visited.has(child)) {
                    return {
                        ...prev,
                        pendingChildren: children,
                        activeEdge: { from: prev.current!, to: child },
                        stepType: "CHECK_VISITED",
                        stepMessage: `Child ${child} already visited, skipping`
                    };
                }

                const newStack = [...prev.stack, child];

                return {
                    ...prev,
                    stack: newStack,
                    pendingChildren: children,
                    activeEdge: { from: prev.current!, to: child },
                    stepType: isRecursive ? "CALL_RECURSIVE" : "PUSH_CHILD",
                    recursionDepth: isRecursive ? prev.recursionDepth + 1 : prev.recursionDepth,
                    stepMessage: isRecursive
                        ? `Recursive call: DFS(${child}) at depth ${prev.recursionDepth + 1}`
                        : `Push node ${child} onto stack`
                };
            }

            if (prev.stack.length === 0) {
                if (prev.visitOrder.length === 0) {
                    return {
                        ...prev,
                        stack: [0],
                        stepType: "INIT",
                        stepMessage: isRecursive
                            ? "Starting DFS: Calling DFS(0)"
                            : "Starting DFS: Push root node 0 onto stack"
                    };
                }
                return {
                    ...prev,
                    isRunning: false,
                    isComplete: true,
                    current: null,
                    activeEdge: null,
                    stepType: "DONE",
                    stepMessage: `DFS Complete. Visit order: ${prev.visitOrder.join(" -> ")}`
                };
            }

            const stack = [...prev.stack];
            const nodeId = stack.pop()!;
            const node = nodes.find(n => n.id === nodeId);

            if (prev.visited.has(nodeId)) {
                return {
                    ...prev,
                    stack,
                    activeEdge: null,
                    stepType: "CHECK_VISITED",
                    recursionDepth: isRecursive ? Math.max(0, prev.recursionDepth - 1) : prev.recursionDepth,
                    stepMessage: `Node ${nodeId} already visited, ${isRecursive ? "returning" : "skipping"}`
                };
            }

            const newVisited = new Set(prev.visited);
            newVisited.add(nodeId);
            const newVisitOrder = [...prev.visitOrder, nodeId];
            const children = node ? [...node.children].reverse() : [];

            return {
                ...prev,
                current: nodeId,
                visited: newVisited,
                visitOrder: newVisitOrder,
                stack,
                pendingChildren: children,
                parentNode: prev.current,
                activeEdge: null,
                stepType: "MARK_VISITED",
                stepMessage: `Visiting node ${nodeId}${children.length > 0 ? ` - exploring ${children.length} children` : " - leaf node"}`
            };
        });
    }, [nodes, traversalType]);

    useEffect(() => {
        if (dfsState.isRunning && !dfsState.isComplete) {
            animationRef.current = setTimeout(stepDFS, speed);
        }
        return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [dfsState.isRunning, dfsState.isComplete, dfsState.visited, dfsState.stack, dfsState.pendingChildren, speed, stepDFS]);

    const startAutoPlay = useCallback(() => {
        if (dfsState.isComplete) {
            reset();
            setTimeout(() => setDfsState(prev => ({ ...prev, isRunning: true })), 100);
            return;
        }
        setDfsState(prev => ({ ...prev, isRunning: true }));
    }, [dfsState.isComplete, reset]);

    const pause = useCallback(() => {
        setDfsState(prev => ({ ...prev, isRunning: false }));
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const stepForward = useCallback(() => {
        if (dfsState.isComplete || dfsState.isRunning) return;
        stepDFS();
    }, [dfsState.isComplete, dfsState.isRunning, stepDFS]);

    const stepBack = useCallback(() => {
        if (stepHistory.length > 0 && !dfsState.isRunning) {
            const previousState = stepHistory[stepHistory.length - 1];
            setDfsState({ ...previousState, isRunning: false });
            setStepHistory(prev => prev.slice(0, -1));
        }
    }, [stepHistory, dfsState.isRunning]);

    const getNodeColor = (nodeId: number) => {
        if (dfsState.current === nodeId) return "fill-amber-400 stroke-amber-500";
        if (dfsState.visited.has(nodeId)) return "fill-emerald-500 stroke-emerald-600";
        if (dfsState.stack.includes(nodeId)) return "fill-violet-500 stroke-violet-600";
        return isDarkMode ? "fill-slate-600 stroke-slate-500" : "fill-slate-300 stroke-slate-400";
    };

    const PSEUDOCODE = traversalType === "stack" ? STACK_PSEUDOCODE : RECURSIVE_PSEUDOCODE;
    const stepMap = traversalType === "stack" ? stackStepMap : recursiveStepMap;

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
                        <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent truncate">
                            DFS Visualizer
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
                        <button onClick={() => setShowTheory(true)} className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs lg:text-sm font-semibold transition-all">
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
                                disabled={dfsState.isRunning}
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
                                disabled={dfsState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                <option value="directed">Directed</option>
                                <option value="undirected">Undirected</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>Traversal Method</label>
                            <select
                                value={traversalType}
                                onChange={(e) => { setTraversalType(e.target.value as "stack" | "recursion"); reset(); }}
                                disabled={dfsState.isRunning}
                                className={`w-full px-3 py-2 rounded-lg text-sm border disabled:opacity-50 ${theme.input}`}
                            >
                                <option value="stack">Stack (Iterative)</option>
                                <option value="recursion">Recursion</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${theme.textLabel}`}>Speed</span>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isDarkMode ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>{speed}ms</span>
                            </div>
                            <input
                                type="range" min="200" max="2000" step="100"
                                value={2200 - speed}
                                onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
                                className="w-full accent-violet-500"
                            />
                        </div>
                    </div>

                    <div className={`rounded-xl p-4 border ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme.textLabel}`}>Controls</h3>
                        <div className="space-y-2">
                            {!dfsState.isRunning ? (
                                <button
                                    onClick={startAutoPlay}
                                    disabled={dfsState.isComplete}
                                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm disabled:opacity-50 transition-all"
                                >
                                    Start DFS
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
                                    disabled={dfsState.isRunning || stepHistory.length === 0}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={stepForward}
                                    disabled={dfsState.isRunning || dfsState.isComplete}
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
                </div>

                {/* Center Panel */}
                <div className="flex-1 flex flex-col gap-3 min-h-[500px] lg:min-h-0">
                    <div className={`rounded-lg px-4 py-2.5 border ${dfsState.isComplete ? (isDarkMode ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-400 bg-emerald-50') : (isDarkMode ? 'border-violet-500/50 bg-violet-500/10' : 'border-violet-400 bg-violet-50')}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {dfsState.stepMessage}
                        </p>
                    </div>

                    <div className={`flex-1 rounded-xl border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-300'}`}>

                        {/* Algorithm State - Overlay on Desktop, Stays on top of SVG */}
                        <div className={`absolute top-2 left-2 lg:top-4 lg:left-4 w-[calc(100%-1rem)] lg:w-60 rounded-lg border z-10 transition-all ${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-300 shadow-lg'}`}>
                            <div className={`px-3 py-1.5 lg:py-2 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                <h4 className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>
                                    {traversalType === "stack" ? "Stack State" : "Call Stack"}
                                </h4>
                            </div>
                            <div className="p-2 lg:p-3 space-y-2 lg:space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] lg:text-xs font-medium ${theme.textLabel}`}>Current:</span>
                                    <span className={`text-xs lg:text-sm font-bold px-2 py-0.5 rounded ${dfsState.current !== null ? 'bg-amber-500 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')}`}>
                                        {dfsState.current !== null ? dfsState.current : "-"}
                                    </span>
                                </div>

                                <div className="hidden lg:block">
                                    <span className={`text-xs font-medium block mb-1 ${theme.textLabel}`}>
                                        {traversalType === "stack" ? "Stack (LIFO):" : "Recursion Depth:"}
                                    </span>
                                    <div className={`flex flex-wrap gap-1 min-h-[24px] p-1.5 rounded border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                                        {dfsState.stack.length > 0 ? (
                                            [...dfsState.stack].reverse().map((id, idx) => (
                                                <span key={`${id}-${idx}`} className="px-1.5 py-0.5 rounded bg-violet-600 text-white text-xs font-medium">{id}</span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">Empty</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span className={`text-[10px] lg:text-xs font-medium block mb-0.5 lg:mb-1 ${theme.textLabel}`}>Visit Order:</span>
                                    <div className={`p-1 lg:p-1.5 rounded border font-mono text-[9px] lg:text-xs min-h-[24px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                        {dfsState.visitOrder.length > 0 ? dfsState.visitOrder.join(" -> ") : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tree SVG */}
                        <div className="w-full h-full flex items-center justify-center pt-20 lg:pt-0">
                            <svg viewBox="0 0 700 350" className="w-full h-auto max-h-full">
                                {nodes.map(node =>
                                    node.children.map(childId => {
                                        const child = nodes.find(n => n.id === childId);
                                        if (!child) return null;
                                        const isActive = dfsState.activeEdge?.from === node.id && dfsState.activeEdge?.to === childId;
                                        const isVisited = dfsState.visited.has(node.id) && dfsState.visited.has(childId);

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

                                {nodes.map(node => (
                                    <g key={node.id}>
                                        <motion.circle
                                            cx={node.x} cy={node.y} r="18"
                                            className={`${getNodeColor(node.id)} transition-colors duration-200`}
                                            strokeWidth="2"
                                            animate={{ scale: dfsState.current === node.id ? 1.15 : 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        />
                                        <text
                                            x={node.x} y={node.y}
                                            textAnchor="middle" dominantBaseline="central"
                                            className={`text-xs font-semibold pointer-events-none ${dfsState.current === node.id || dfsState.visited.has(node.id) || dfsState.stack.includes(node.id)
                                                ? 'fill-white'
                                                : isDarkMode ? 'fill-white' : 'fill-slate-700'
                                                }`}
                                        >
                                            {node.label}
                                        </text>
                                        {dfsState.visited.has(node.id) && (
                                            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                                                <circle cx={node.x + 14} cy={node.y - 14} r="8" className="fill-emerald-600" />
                                                <text x={node.x + 14} y={node.y - 14} textAnchor="middle" dominantBaseline="central" className="fill-white text-[8px] font-bold">
                                                    {dfsState.visitOrder.indexOf(node.id) + 1}
                                                </text>
                                            </motion.g>
                                        )}
                                    </g>
                                ))}
                            </svg>
                        </div>

                        <div className={`absolute bottom-2 left-2 lg:bottom-3 lg:left-4 flex flex-wrap gap-2 lg:gap-4 text-[9px] lg:text-xs rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border z-10 ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-300'}`}>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className={theme.textLabel}>Current</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-violet-500" /><span className={theme.textLabel}>In Stack</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className={theme.textLabel}>Visited</span></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Wider */}
                <div className="w-full lg:w-72 flex flex-col flex-shrink-0">
                    <div className={`flex-1 rounded-xl p-4 border overflow-hidden flex flex-col ${theme.panel}`}>
                        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${theme.textLabel}`}>
                            {traversalType === "stack" ? "Stack-Based DFS" : "Recursive DFS"}
                        </h3>
                        <div className={`flex-1 min-h-[300px] lg:min-h-0 overflow-y-auto rounded-lg p-3 font-mono text-[11px] leading-relaxed ${theme.codeBg} border`}>
                            {PSEUDOCODE.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    style={{ paddingLeft: `${line.indent * 0.8}rem` }}
                                    className={`py-0.5 px-1.5 rounded transition-all ${stepMap[dfsState.stepType]?.includes(line.step)
                                        ? isDarkMode ? 'bg-violet-500/40 text-violet-200' : 'bg-violet-100 text-violet-800'
                                        : theme.textMuted
                                        }`}
                                    animate={{ x: stepMap[dfsState.stepType]?.includes(line.step) ? 3 : 0 }}
                                >
                                    {line.text}
                                </motion.div>
                            ))}
                        </div>

                        <div className={`mt-3 p-2.5 rounded-lg border text-[10px] leading-relaxed ${isDarkMode ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-800'}`}>
                            {traversalType === "stack"
                                ? "Iterative DFS uses an explicit stack. Nodes are pushed and popped in LIFO order."
                                : "Recursive DFS uses the call stack implicitly. Each recursive call explores one branch deeply."}
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
                                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Build Tree Manually</h2>
                                <button onClick={() => setShowBuildGraph(false)} className={`hover:text-red-400 text-2xl ${theme.textMuted}`}>×</button>
                            </div>

                            <div className={`px-6 py-2 text-sm border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                                Click a node to select it (yellow), then click another node to create an edge from parent to child.
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
                                            <circle cx={node.x} cy={node.y} r="22" className={`${selectedNode === node.id ? 'fill-yellow-400 stroke-yellow-300' : 'fill-slate-600 stroke-slate-400'} hover:fill-slate-500 transition-colors`} strokeWidth="3" />
                                            <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" className="text-sm font-bold pointer-events-none fill-white">{node.label}</text>
                                        </g>
                                    ))}
                                </svg>
                            </div>

                            <div className="flex justify-between px-6 py-4 border-t border-slate-700">
                                <button onClick={() => setShowBuildGraph(false)} className={`px-5 py-2 rounded-lg border font-medium ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>Cancel</button>
                                <button onClick={applyBuiltGraph} className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold">Apply Tree</button>
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
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Depth-First Search</h2>
                                    <p className={`text-xs mt-1 font-medium tracking-widest uppercase ${theme.textMuted}`}>Algorithm Fundamentals</p>
                                </div>
                                <button onClick={() => setShowTheory(false)} className={`p-2 rounded-full hover:bg-red-500/10 ${theme.textMuted} hover:text-red-400`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className={`space-y-5 text-sm max-h-[65vh] overflow-y-auto pr-2 ${theme.textLabel}`}>
                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-violet-500 rounded-full" /> What is DFS?
                                    </h3>
                                    <p className="leading-relaxed">Depth-First Search is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It goes "deep" into the graph before exploring neighbors at the same level.</p>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" /> Stack-Based (Iterative) Approach
                                    </h3>
                                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className="mb-2">Uses an explicit <strong className="text-violet-400">Stack</strong> data structure (Last-In-First-Out).</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Push the starting node onto the stack</li>
                                            <li>Pop a node, mark it visited, push its unvisited children</li>
                                            <li>Repeat until stack is empty</li>
                                            <li>Advantage: No risk of stack overflow for deep graphs</li>
                                        </ul>
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-purple-500 rounded-full" /> Recursive Approach
                                    </h3>
                                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className="mb-2">Uses the <strong className="text-purple-400">Call Stack</strong> implicitly through function calls.</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Base case: return if node is already visited</li>
                                            <li>Mark current node as visited</li>
                                            <li>Recursively call DFS on each unvisited child</li>
                                            <li>Advantage: Cleaner, more intuitive code</li>
                                            <li>Disadvantage: Risk of stack overflow for very deep graphs</li>
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
                                            <p className="font-mono text-violet-400 font-bold">O(V + E)</p>
                                        </div>
                                        <div className={`p-3 rounded-lg border text-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <p className="text-xs font-medium mb-1">Space Complexity</p>
                                            <p className="font-mono text-violet-400 font-bold">O(V)</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-amber-500 rounded-full" /> Use Cases
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Topological sorting</li>
                                        <li>Cycle detection in graphs</li>
                                        <li>Pathfinding in mazes</li>
                                        <li>Connected components</li>
                                        <li>Solving puzzles (Sudoku, N-Queens)</li>
                                    </ul>
                                </section>
                            </div>

                            <button onClick={() => setShowTheory(false)} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-violet-500/20">
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}