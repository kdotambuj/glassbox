"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// Types
interface GraphNode {
    id: number;
    x: number;
    y: number;
    label: string;
}

interface GraphEdge {
    from: number;
    to: number;
    weight: number;
}

type StepType =
    | "INIT"
    | "EXTRACT_MIN"
    | "SKIP_VISITED"
    | "RELAX_EDGE"
    | "UPDATE_DISTANCE"
    | "DONE";

interface DijkstraState {
    current: number | null;
    visited: Set<number>;
    distances: Map<number, number>;
    previous: Map<number, number | null>;
    priorityQueue: Array<{ node: number; distance: number }>;
    isRunning: boolean;
    isComplete: boolean;
    currentStep: number;
    stepMessage: string;
    activeEdge: { from: number; to: number } | null;
    shortestPath: number[];
    totalCost: number | null;
    stepType: StepType; // 
}


// Pseudocode with proper indentation
const PSEUDOCODE = [
    { text: "Dijkstra(Graph, start):", indent: 0, step: 0 },
    { text: "priorityQueue.add(start, 0)", indent: 1, step: 1 },
    { text: "while priorityQueue is not empty:", indent: 1, step: 2 },
    { text: "u = priorityQueue.poll()", indent: 2, step: 3 },
    { text: "if u is visited: continue", indent: 2, step: 4 },
    { text: "mark u as visited", indent: 2, step: 5 },
    { text: "for each neighbor v of u:", indent: 2, step: 6 },
    { text: "if dist[u] + weight < dist[v]:", indent: 3, step: 7 },
    { text: "dist[v] = dist[u] + weight", indent: 4, step: 8 },
    { text: "priorityQueue.add(v, dist[v])", indent: 4, step: 9 },
];
const stepMap: Record<StepType, number[]> = {
    INIT: [0, 1],
    EXTRACT_MIN: [2, 3],
    SKIP_VISITED: [4],
    RELAX_EDGE: [5, 6, 7],
    UPDATE_DISTANCE: [8, 9],
    DONE: [2],
};

// Generate graph based on number of vertices
const createGraph = (numVertices: number): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    const nodes: GraphNode[] = [];
    const centerX = 480;
    const centerY = 220;
    const radius = 150;

    for (let i = 0; i < numVertices; i++) {
        const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
        nodes.push({
            id: i,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            label: String.fromCharCode(65 + i),
        });
    }

    // Create edges ensuring connectivity
    const edges: GraphEdge[] = [];
    for (let i = 0; i < numVertices; i++) {
        const next = (i + 1) % numVertices;
        edges.push({ from: i, to: next, weight: Math.floor(Math.random() * 8) + 2 });
    }
    // Add some cross edges for variety
    if (numVertices >= 4) {
        edges.push({ from: 0, to: Math.floor(numVertices / 2), weight: Math.floor(Math.random() * 8) + 2 });
    }
    if (numVertices >= 5) {
        edges.push({ from: 1, to: numVertices - 2, weight: Math.floor(Math.random() * 8) + 2 });
    }

    return { nodes, edges };
};

export default function DijkstraPage() {
    const [numVertices, setNumVertices] = useState(5);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [startNode, setStartNode] = useState(0);
    const [endNode, setEndNode] = useState(4);
    const [isDirected, setIsDirected] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [showTheory, setShowTheory] = useState(false);
    const [showBuildGraph, setShowBuildGraph] = useState(false);
    const [showAlert, setShowAlert] = useState<string | null>(null);

    // Build graph state
    const [buildNodes, setBuildNodes] = useState<GraphNode[]>([]);
    const [buildEdges, setBuildEdges] = useState<GraphEdge[]>([]);
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const [pendingEdge, setPendingEdge] = useState<{ from: number; to: number } | null>(null);
    const [edgeWeightInput, setEdgeWeightInput] = useState("");

    // Step history for step back
    const [stepHistory, setStepHistory] = useState<DijkstraState[]>([]);

    const [dijkstraState, setDijkstraState] = useState<DijkstraState>({
        current: null,
        visited: new Set(),
        distances: new Map(),
        previous: new Map(),
        priorityQueue: [],
        isRunning: false,
        isComplete: false,
        currentStep: 0,
        stepMessage: "Click 'Auto Play' or 'Step Forward' to start",
        activeEdge: null,
        shortestPath: [],
        totalCost: null,
        stepType: "INIT", // ✅ ADD
    });

    const animationRef = useRef<NodeJS.Timeout | null>(null);

    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(true);

    const theme = {
        bg: isDarkMode ? "bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white" : "bg-slate-50 text-slate-900",
        panel: isDarkMode ? "bg-slate-900/60 border-white/10" : "bg-white/80 border-slate-200 shadow-sm",
        header: isDarkMode ? "bg-black/50 border-white/10" : "bg-white/80 border-slate-200 shadow-sm",
        input: isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900",
        textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
        textLabel: isDarkMode ? "text-slate-300" : "text-slate-600",
        divider: isDarkMode ? "bg-white/20" : "bg-slate-300",
        graphBg: isDarkMode ? "bg-slate-900/60 border-white/10" : "bg-white/60 border-slate-200 shadow-inner",
        modal: isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-2xl",
        buttonNormal: isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-800 hover:bg-slate-900 text-white shadow-sm font-medium",
        codeBg: isDarkMode ? "bg-slate-950/50 border-white/5" : "bg-slate-100 border-slate-300 shadow-inner",
    };

    // Initialize graph when numVertices changes
    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = createGraph(numVertices);
        setNodes(newNodes);
        setEdges(newEdges);
        setStartNode(0);
        setEndNode(numVertices - 1);
        reset();
    }, [numVertices]);

    // Get traversable edges for algorithm (both directions for directed)
    const getTraversableEdges = useCallback(() => {
        if (isDirected) return edges;

        // For undirected, ensure bidirectional traversal
        const allEdges: GraphEdge[] = [...edges];
        edges.forEach(edge => {
            // Check if reverse edge already exists
            const hasReverse = allEdges.some(e => e.from === edge.to && e.to === edge.from);
            if (!hasReverse) {
                allEdges.push({ from: edge.to, to: edge.from, weight: edge.weight });
            }
        });
        return allEdges;
    }, [edges, isDirected]);

    // Initialize Dijkstra
    const initializeDijkstra = useCallback(() => {
        if (nodes.length === 0) {
            setShowAlert("No graph to run algorithm on!");
            return;
        }

        const distances = new Map<number, number>();
        const previous = new Map<number, number | null>();

        nodes.forEach(node => {
            distances.set(node.id, Infinity);
            previous.set(node.id, null);
        });

        distances.set(startNode, 0);
        const priorityQueue = [{ node: startNode, distance: 0 }];

        setStepHistory([]);
        setDijkstraState({
            current: null,
            visited: new Set(),
            distances,
            previous,
            priorityQueue,
            isRunning: false,
            isComplete: false,
            currentStep: 10,
            stepMessage: `Initialized: Start vertex ${nodes.find(n => n.id === startNode)?.label}`,
            activeEdge: null,
            shortestPath: [],
            totalCost: null,
            stepType: "INIT", // ✅ ADD
        });

    }, [nodes, startNode]);

    // Step Dijkstra - Single step only
    const stepDijkstra = useCallback(() => {
        setDijkstraState(prev => {
            if (prev.isComplete) return prev;

            // Save history
            setStepHistory(h => [
                ...h,
                {
                    ...prev,
                    visited: new Set(prev.visited),
                    distances: new Map(prev.distances),
                    previous: new Map(prev.previous),
                    priorityQueue: [...prev.priorityQueue],
                }
            ]);

            if (prev.priorityQueue.length === 0) {
                return {
                    ...prev,
                    isComplete: true,
                    stepType: "DONE",
                    stepMessage: "Algorithm completed"
                };
            }

            // Extract min
            const queue = [...prev.priorityQueue].sort(
                (a, b) => a.distance - b.distance
            );
            const { node: u, distance: uDist } = queue.shift()!;
            const newQueue = queue;

            if (prev.visited.has(u)) {
                return {
                    ...prev,
                    priorityQueue: newQueue,
                    stepType: "SKIP_VISITED",
                    stepMessage: `Skipped ${nodes.find(n => n.id === u)?.label} (already visited)`
                };
            }

            const newVisited = new Set(prev.visited);
            newVisited.add(u);

            // 🎯 STOP when end node is finalized
            if (u === endNode) {
                const path: number[] = [];
                let curr: number | null = endNode;

                while (curr !== null) {
                    path.unshift(curr);
                    curr = prev.previous.get(curr) ?? null;
                }

                return {
                    ...prev,
                    visited: newVisited,
                    current: u,
                    isRunning: false,
                    isComplete: true,
                    shortestPath: path,
                    totalCost: uDist,
                    priorityQueue: [],
                    stepType: "DONE",
                    stepMessage: "Algorithm completed"
                };
            }

            // Relax neighbors
            const newDistances = new Map(prev.distances);
            const newPrevious = new Map(prev.previous);
            let activeEdge: { from: number; to: number } | null = null;
            let message = `Processing ${nodes.find(n => n.id === u)?.label}`;
            let stepType: DijkstraState["stepType"] = "EXTRACT_MIN";

            getTraversableEdges()
                .filter(e => e.from === u)
                .forEach(edge => {
                    const v = edge.to;
                    if (newVisited.has(v)) return;

                    const alt = uDist + edge.weight;
                    activeEdge = { from: u, to: v };
                    stepType = "RELAX_EDGE";

                    if (alt < (newDistances.get(v) ?? Infinity)) {
                        newDistances.set(v, alt);
                        newPrevious.set(v, u);
                        newQueue.push({ node: v, distance: alt });

                        message = `Updated distance of ${nodes.find(n => n.id === v)?.label
                            } to ${alt}`;
                        stepType = "UPDATE_DISTANCE";
                    }
                });

            return {
                ...prev,
                current: u,
                visited: newVisited,
                distances: newDistances,
                previous: newPrevious,
                priorityQueue: newQueue,
                activeEdge,
                stepType,
                stepMessage: message
            };
        });
    }, [nodes, endNode, getTraversableEdges]);


    // Auto Play - starts automatic stepping
    const startAutoPlay = useCallback(() => {
        if (dijkstraState.isComplete) {
            reset();
            setTimeout(() => {
                initializeDijkstra();
                setTimeout(() => {
                    setDijkstraState(prev => ({ ...prev, isRunning: true }));
                }, 100);
            }, 100);
            return;
        }
        if (dijkstraState.priorityQueue.length === 0 && dijkstraState.distances.size === 0) {
            initializeDijkstra();
            setTimeout(() => {
                setDijkstraState(prev => ({ ...prev, isRunning: true }));
            }, 100);
        } else {
            setDijkstraState(prev => ({ ...prev, isRunning: true }));
        }
    }, [dijkstraState.isComplete, dijkstraState.priorityQueue.length, dijkstraState.distances.size, initializeDijkstra]);

    const pause = useCallback(() => {
        setDijkstraState(prev => ({ ...prev, isRunning: false }));
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            animationRef.current = null;
        }
        setStepHistory([]);
        setDijkstraState({
            current: null,
            visited: new Set(),
            distances: new Map(),
            previous: new Map(),
            priorityQueue: [],
            isRunning: false,
            isComplete: false,
            currentStep: 0,
            stepMessage: "Click 'Auto Play' or 'Step Forward' to start",
            activeEdge: null,
            shortestPath: [],
            totalCost: null,
            stepType: "INIT", // 
        });
    }, []);

    const stepBack = useCallback(() => {
        if (stepHistory.length > 0) {
            const previousState = stepHistory[stepHistory.length - 1];
            setDijkstraState({ ...previousState, isRunning: false });
            setStepHistory(prev => prev.slice(0, -1));
        }
    }, [stepHistory]);

    // Step Forward - ONLY does one step, no auto-run
    const stepForward = useCallback(() => {
        if (dijkstraState.isComplete) return;

        if (dijkstraState.priorityQueue.length === 0 && dijkstraState.distances.size === 0) {
            // First step - just initialize
            initializeDijkstra();
        } else {
            // Regular step
            stepDijkstra();
        }
    }, [dijkstraState.priorityQueue.length, dijkstraState.distances.size, dijkstraState.isComplete, initializeDijkstra, stepDijkstra]);

    // Animation loop - ONLY runs when isRunning is true
    useEffect(() => {
        if (dijkstraState.isRunning && !dijkstraState.isComplete && dijkstraState.priorityQueue.length > 0) {
            animationRef.current = setTimeout(() => {
                stepDijkstra();
            }, speed);
        }

        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
        };
    }, [dijkstraState.isRunning, dijkstraState.isComplete, dijkstraState.visited, speed, stepDijkstra]);

    // Generate random graph
    const generateRandomGraph = () => {
        reset();
        const { nodes: newNodes, edges: newEdges } = createGraph(numVertices);
        setNodes(newNodes);
        setEdges(newEdges);
        setShowAlert("Random graph generated!");
        setTimeout(() => setShowAlert(null), 2000);
    };

    // Build graph functions
    const openBuildGraph = () => {
        const buildGraphNodes: GraphNode[] = [];
        const centerX = 400;
        const centerY = 180;
        const radius = 130;

        for (let i = 0; i < numVertices; i++) {
            const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
            buildGraphNodes.push({
                id: i,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                label: String.fromCharCode(65 + i),
            });
        }

        setBuildNodes(buildGraphNodes);
        setBuildEdges([]);
        setSelectedNode(null);
        setPendingEdge(null);
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
            setPendingEdge({ from: selectedNode, to: nodeId });
            setEdgeWeightInput("");
        } else {
            setSelectedNode(null);
        }
    };

    const confirmAddEdge = () => {
        if (pendingEdge) {
            const weight = parseInt(edgeWeightInput) || 1;
            if (weight <= 0) {
                setShowAlert("Weight must be positive!");
                setTimeout(() => setShowAlert(null), 2000);
                return;
            }
            setBuildEdges(prev => [...prev, { from: pendingEdge.from, to: pendingEdge.to, weight }]);
            setPendingEdge(null);
            setSelectedNode(null);
            setEdgeWeightInput("");
        }
    };

    const cancelAddEdge = () => {
        setPendingEdge(null);
        setSelectedNode(null);
        setEdgeWeightInput("");
    };

    const applyBuiltGraph = () => {
        if (buildEdges.length === 0) {
            setShowAlert("Please add at least one edge!");
            setTimeout(() => setShowAlert(null), 2000);
            return;
        }
        setNodes(buildNodes);
        setEdges(buildEdges);
        setStartNode(0);
        setEndNode(buildNodes.length - 1);
        setShowBuildGraph(false);
        reset();
        setShowAlert("Custom graph applied!");
        setTimeout(() => setShowAlert(null), 2000);
    };

    // Get node color
    const getNodeColor = (nodeId: number) => {
        if (nodeId === startNode) return "fill-emerald-500 stroke-emerald-300";
        if (nodeId === endNode) return "fill-rose-500 stroke-rose-300";
        if (dijkstraState.current === nodeId) return "fill-yellow-400 stroke-yellow-200";
        if (dijkstraState.visited.has(nodeId)) return "fill-green-500 stroke-green-300";
        if (dijkstraState.priorityQueue.some(item => item.node === nodeId)) return "fill-blue-400 stroke-blue-200";
        return "fill-slate-600 stroke-slate-400";
    };

    // Check if edge is active
    const isActiveEdge = (from: number, to: number) => {
        return dijkstraState.activeEdge?.from === from && dijkstraState.activeEdge?.to === to;
    };

    return (
        <div className={`min-h-screen lg:h-screen flex flex-col lg:overflow-hidden transition-colors duration-500 ${theme.bg}`}>
            {/* Alert */}
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 border border-white/20 rounded-lg px-6 py-3 shadow-xl"
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
                className={`border-b backdrop-blur-md z-50 flex-shrink-0 transition-colors duration-300 ${theme.header}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Link href="/" className={`flex items-center gap-1 lg:gap-2 hover:opacity-80 transition-colors ${theme.textMuted}`}>
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm lg:text-base">Back</span>
                        </Link>
                        <div className={`h-6 w-px ${theme.divider}`} />
                        <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent truncate">
                            Dijkstra's Algorithm
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-1.5 lg:p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                        >
                            {isDarkMode ? (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => setShowTheory(true)}
                            className="flex items-center gap-1 lg:gap-2 px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs lg:text-sm font-semibold shadow-lg transition-all"
                        >
                            About
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-y-auto lg:overflow-hidden">
                {/* Left Panel - Controls Only */}
                <div className="w-full lg:w-72 flex flex-col gap-2 flex-shrink-0">
                    {/* Number of Vertices */}
                    <div className={`backdrop-blur-sm rounded-lg p-2.5 border transition-colors ${theme.panel}`}>
                        <label className={`text-xs font-semibold mb-1 block ${theme.textLabel}`}>Number of Vertices</label>
                        <select
                            value={numVertices}
                            onChange={(e) => setNumVertices(parseInt(e.target.value))}
                            disabled={dijkstraState.isRunning}
                            className={`w-full px-2 py-1.5 rounded text-sm disabled:opacity-50 transition-colors ${theme.input}`}
                        >
                            {[3, 4, 5, 6, 7].map(n => (
                                <option key={n} value={n} className={isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"}>{n} vertices</option>
                            ))}
                        </select>
                    </div>

                    {/* Start & End Vertex */}
                    <div className={`backdrop-blur-sm rounded-lg p-2.5 border transition-colors ${theme.panel}`}>
                        <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
                            <div>
                                <label className={`text-xs font-semibold mb-1 block ${theme.textLabel}`}>Start Vertex</label>
                                <select
                                    value={startNode}
                                    onChange={(e) => { setStartNode(parseInt(e.target.value)); reset(); }}
                                    disabled={dijkstraState.isRunning}
                                    className={`w-full px-2 py-1.5 rounded text-sm disabled:opacity-50 transition-colors ${theme.input}`}
                                >
                                    {nodes.map(node => (
                                        <option key={node.id} value={node.id} className={isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"}>{node.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={`text-xs font-semibold mb-1 block ${theme.textLabel}`}>End Vertex</label>
                                <select
                                    value={endNode}
                                    onChange={(e) => setEndNode(parseInt(e.target.value))}
                                    disabled={dijkstraState.isRunning}
                                    className={`w-full px-2 py-1.5 rounded text-sm disabled:opacity-50 transition-colors ${theme.input}`}
                                >
                                    {nodes.map(node => (
                                        <option key={node.id} value={node.id} className={isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"}>{node.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Graph Type & Generate */}
                    <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
                        <div className={`backdrop-blur-sm rounded-lg p-2.5 border transition-colors ${theme.panel}`}>
                            <h3 className={`text-xs font-semibold mb-1.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Graph Type</h3>
                            <div className="flex lg:block items-center justify-around gap-2">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" checked={!isDirected} onChange={() => { setIsDirected(false); reset(); }} disabled={dijkstraState.isRunning} className="w-3 h-3 accent-teal-500" />
                                    <span className={`text-[10px] ${theme.textMuted}`}>Undirected</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" checked={isDirected} onChange={() => { setIsDirected(true); reset(); }} disabled={dijkstraState.isRunning} className="w-3 h-3 accent-teal-500" />
                                    <span className={`text-[10px] ${theme.textMuted}`}>Directed</span>
                                </label>
                            </div>
                        </div>

                        <div className={`backdrop-blur-sm rounded-lg p-2.5 border transition-colors ${theme.panel}`}>
                            <h3 className={`text-xs font-semibold mb-1.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Graph Generator</h3>
                            <div className="grid grid-cols-1 gap-1">
                                <button onClick={generateRandomGraph} disabled={dijkstraState.isRunning} className={`px-2 py-1 rounded text-[10px] disabled:opacity-50 transition-colors border ${isDarkMode ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30" : "bg-slate-700 hover:bg-slate-800 text-white shadow-sm font-semibold"}`}>
                                    Random
                                </button>
                                <button onClick={openBuildGraph} disabled={dijkstraState.isRunning} className={`px-2 py-1 rounded text-[10px] disabled:opacity-50 transition-colors border ${isDarkMode ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30" : "bg-slate-700 hover:bg-slate-800 text-white shadow-sm font-semibold"}`}>
                                    Manual
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className={`backdrop-blur-sm rounded-lg p-2.5 border transition-colors ${theme.panel}`}>
                        <h3 className={`text-xs font-semibold mb-1.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}>Controls</h3>
                        <div className="space-y-1">
                            {!dijkstraState.isRunning ? (
                                <button onClick={startAutoPlay} disabled={dijkstraState.isComplete} className="w-full px-2 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium shadow-lg disabled:opacity-50 transition-all">
                                    Auto Play
                                </button>
                            ) : (
                                <button onClick={pause} className="w-full px-2 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium shadow-lg transition-all">
                                    Pause
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-1">
                                <button onClick={stepBack} disabled={dijkstraState.isRunning || stepHistory.length === 0} className={`px-2 py-1.5 rounded text-xs disabled:opacity-50 transition-colors ${theme.buttonNormal}`}>
                                    Back
                                </button>
                                <button onClick={stepForward} disabled={dijkstraState.isRunning || dijkstraState.isComplete} className={`px-2 py-1.5 rounded text-xs disabled:opacity-50 transition-colors ${theme.buttonNormal}`}>
                                    Next
                                </button>
                            </div>
                            <button onClick={reset} className={`w-full px-2 py-1.5 rounded text-xs transition-colors ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-600 hover:bg-red-700 text-white shadow-md font-semibold"}`}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Speed Slider */}
                    <div className={`backdrop-blur-sm rounded-lg p-3 border transition-colors ${theme.panel}`}>
                        <div className="flex items-center justify-between mb-2">
                            <label className={`text-[10px] font-bold uppercase tracking-wider ${theme.textLabel}`}>Speed</label>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'}`}>
                                {speed}ms
                            </span>
                        </div>
                        <input
                            type="range" min="100" max="2500" step="50"
                            value={2600 - speed}
                            onChange={(e) => setSpeed(2600 - parseInt(e.target.value))}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                    </div>
                </div>

                {/* Center Panel - Graph with Algorithm State Overlay */}
                <div className="flex-1 flex flex-col min-h-[500px] lg:min-h-0">
                    {/* Step Message - More Prominent */}
                    <motion.div
                        className="bg-gradient-to-r from-blue-900/80 to-teal-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border-2 border-teal-500/50 mb-2 shadow-lg shadow-teal-500/20"
                        animate={{ scale: dijkstraState.stepMessage.includes("PROCESSING") || dijkstraState.stepMessage.includes("DEQUEUED") ? [1, 1.01, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-sm font-bold text-white tracking-wide">{dijkstraState.stepMessage}</p>
                    </motion.div>

                    {/* Shortest Path Results */}
                    <AnimatePresence>
                        {dijkstraState.isComplete && dijkstraState.shortestPath.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border-2 rounded-lg px-4 py-2 mb-2 shadow-lg ${isDarkMode ? "bg-emerald-500/20 border-emerald-500/50" : "bg-emerald-100 border-emerald-400"}`}
                            >
                                <div className={`flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between ${isDarkMode ? "text-emerald-300" : "text-emerald-900"}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[10px] lg:text-sm uppercase tracking-wider">Path:</span>
                                        <span className={`font-mono text-sm lg:text-base lg:px-3 lg:py-1 rounded border ${isDarkMode ? "text-white bg-slate-800 border-emerald-500/30" : "text-emerald-900 bg-white border-emerald-300"}`}>
                                            {dijkstraState.shortestPath.map(id => nodes.find(n => n.id === id)?.label).join(" → ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[10px] lg:text-sm uppercase tracking-wider">Cost:</span>
                                        <span className={`font-mono text-sm lg:text-base lg:px-3 lg:py-1 rounded border ${isDarkMode ? "text-white bg-slate-800 border-emerald-500/30" : "text-emerald-900 bg-white border-emerald-300"}`}>
                                            {dijkstraState.totalCost}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Graph Container with Algorithm State Overlay */}
                    <div className={`flex-1 backdrop-blur-sm rounded-xl border relative overflow-hidden transition-colors ${theme.graphBg}`}>
                        {/* Algorithm State Overlay - Top Left */}
                        <div className={`absolute top-2 left-2 lg:top-3 lg:left-3 z-10 w-[calc(100%-1rem)] lg:w-64 backdrop-blur-sm rounded-lg border p-3 lg:p-4 shadow-xl transition-all ${theme.panel} ${isDarkMode ? "bg-slate-950/95" : "bg-white/95"}`}>
                            <h3 className="text-[10px] lg:text-sm font-bold text-teal-400 mb-2 lg:mb-3 border-b border-gray-500/20 pb-1 lg:pb-2 uppercase tracking-wider">State</h3>

                            <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-3">
                                <div>
                                    <span className={`text-[10px] font-bold ${isDarkMode ? "text-green-400" : "text-green-700"}`}>Visited: </span>
                                    <span className={`text-[10px] font-mono ${isDarkMode ? "text-green-300" : "text-green-800"}`}>
                                        {'{' + Array.from(dijkstraState.visited).map(id => nodes.find(n => n.id === id)?.label).join(",") + '}'}
                                    </span>
                                </div>

                                <div>
                                    <span className={`text-[10px] font-bold ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>Current: </span>
                                    <span className={`text-[10px] font-bold ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                                        {dijkstraState.current !== null ? nodes.find(n => n.id === dijkstraState.current)?.label : "-"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 hidden lg:block">
                                <span className={`text-xs font-bold ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>PQ: </span>
                                <span className={`text-xs font-mono ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                                    [{[...dijkstraState.priorityQueue].sort((a, b) => a.distance - b.distance).slice(0, 3).map(item => `${nodes.find(n => n.id === item.node)?.label}:${item.distance}`).join(", ")}]
                                </span>
                            </div>

                            {/* Distance Map - Compact on Desktop, Hidden or very compact on Mobile */}
                            <div className="mt-3 hidden lg:block">
                                <div className={`text-[10px] font-bold mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Distances:</div>
                                <div className="max-h-40 overflow-y-auto">
                                    <table className={`w-full text-[10px] border ${isDarkMode ? "border-slate-600" : "border-slate-300 bg-white"}`}>
                                        <thead>
                                            <tr className="bg-blue-600 text-white">
                                                <th className="border px-1 py-1 font-bold">Node</th>
                                                <th className="border px-1 py-1 font-bold">Dist</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nodes.map(node => {
                                                const distance = dijkstraState.distances.get(node.id);
                                                const isVisited = dijkstraState.visited.has(node.id);
                                                const isCurrent = dijkstraState.current === node.id;
                                                return (
                                                    <tr key={node.id} className={`${isCurrent ? (isDarkMode ? 'bg-yellow-500/40 text-yellow-200' : 'bg-yellow-100 text-yellow-900') : isVisited ? (isDarkMode ? 'bg-green-500/25 text-green-300' : 'bg-green-100 text-green-900') : isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                                                        <td className="border px-2 py-0.5 font-mono font-bold text-center">{node.label}</td>
                                                        <td className="border px-2 py-0.5 text-center font-mono">
                                                            {distance === undefined ? '-' : distance === Infinity ? '∞' : distance}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Graph SVG */}
                        <div className="w-full h-full flex items-center justify-center pt-20 lg:pt-0">
                            <svg viewBox="0 0 700 440" className="w-full h-auto max-h-full">
                                {/* Draw edges - For directed, only draw original edges (not duplicated) */}
                                {edges.map((edge, idx) => {
                                    const fromNode = nodes.find(n => n.id === edge.from);
                                    const toNode = nodes.find(n => n.id === edge.to);
                                    if (!fromNode || !toNode) return null;

                                    const dx = toNode.x - fromNode.x;
                                    const dy = toNode.y - fromNode.y;
                                    const length = Math.sqrt(dx * dx + dy * dy);
                                    const unitX = dx / length;
                                    const unitY = dy / length;

                                    // For directed: offset lines to show two parallel arrows
                                    const offset = isDirected ? 6 : 0;
                                    const perpX = -unitY * offset;
                                    const perpY = unitX * offset;

                                    // Forward edge (original direction)
                                    const x1f = fromNode.x + perpX + unitX * 28;
                                    const y1f = fromNode.y + perpY + unitY * 28;
                                    const x2f = toNode.x + perpX - unitX * 28;
                                    const y2f = toNode.y + perpY - unitY * 28;

                                    // Backward edge (reverse direction) - only for directed
                                    const x1b = toNode.x - perpX - unitX * 28;
                                    const y1b = toNode.y - perpY - unitY * 28;
                                    const x2b = fromNode.x - perpX + unitX * 28;
                                    const y2b = fromNode.y - perpY + unitY * 28;

                                    // Weight label position - single label between the two lines
                                    const midX = (fromNode.x + toNode.x) / 2;
                                    const midY = (fromNode.y + toNode.y) / 2;

                                    const isActiveForward = isActiveEdge(edge.from, edge.to);
                                    const isActiveBackward = isActiveEdge(edge.to, edge.from);

                                    // Final path coloring
                                    // Final path coloring - Check BOTH directions for Undirected
                                    const isPathForward = dijkstraState.shortestPath.some((id, i) =>
                                        (id === edge.from && dijkstraState.shortestPath[i + 1] === edge.to) ||
                                        (!isDirected && id === edge.to && dijkstraState.shortestPath[i + 1] === edge.from)
                                    );

                                    // Active edge coloring - Check BOTH directions for Undirected
                                    const isEdgeActive = isActiveForward || (!isDirected && isActiveBackward);

                                    return (
                                        <g key={`edge-${idx}`}>
                                            {/* Forward direction */}
                                            <line
                                                x1={x1f} y1={y1f} x2={x2f} y2={y2f}
                                                className={isPathForward ? "stroke-yellow-400 stroke-[5]" : isEdgeActive ? "stroke-red-500 stroke-[3]" : "stroke-slate-500 stroke-[2]"}
                                                strokeOpacity={isPathForward || isEdgeActive ? 1 : 0.6}
                                                markerEnd={isDirected ? `url(#arrow${isPathForward ? '-path' : isActiveForward ? '-active' : ''})` : undefined}
                                            />

                                            {/* Backward direction - only for directed */}
                                            {isDirected && (
                                                <line
                                                    x1={x1b} y1={y1b} x2={x2b} y2={y2b}
                                                    className={isActiveBackward ? "stroke-red-500 stroke-[3]" : "stroke-slate-500 stroke-[2]"}
                                                    strokeOpacity={isActiveBackward ? 1 : 0.6}
                                                    markerEnd={`url(#arrow${isActiveBackward ? '-active' : ''})`}
                                                />
                                            )}

                                            {/* Single weight label - positioned to avoid overlap */}
                                            <circle cx={midX} cy={midY} r="12" className={`${isPathForward ? 'fill-yellow-400 stroke-yellow-200' : isDarkMode ? 'fill-slate-800 stroke-slate-600' : 'fill-white stroke-slate-300'}`} strokeWidth="1.5" />
                                            <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" className={`text-xs font-bold ${isPathForward ? 'fill-slate-900' : isDarkMode ? 'fill-white' : 'fill-slate-900'}`}>{edge.weight}</text>
                                        </g>
                                    );
                                })}

                                {/* Arrow markers */}
                                <defs>
                                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L7,3 z" className="fill-slate-500" />
                                    </marker>
                                    <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L7,3 z" className="fill-red-500" />
                                    </marker>
                                    <marker id="arrow-path" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L7,3 z" className="fill-yellow-400" />
                                    </marker>
                                </defs>

                                {/* Draw nodes */}
                                {nodes.map(node => (
                                    <g key={node.id}>
                                        <motion.circle
                                            cx={node.x}
                                            cy={node.y}
                                            r="26"
                                            className={getNodeColor(node.id)}
                                            strokeWidth="3"
                                            animate={{ scale: dijkstraState.current === node.id ? 1.15 : 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        />
                                        <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" className={`text-base font-bold pointer-events-none ${isDarkMode ? 'fill-white' : 'fill-slate-900'}`}>{node.label}</text>
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {/* Legend - Bottom */}
                        <div className={`absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 lg:gap-3 text-[9px] lg:text-xs rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border transition-colors ${theme.panel} ${isDarkMode ? "bg-slate-950/80" : "bg-white/90"} z-10`}>
                            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className={theme.textMuted}>Start</span></div>
                            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className={theme.textMuted}>End</span></div>
                            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className={theme.textMuted}>Current</span></div>
                            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-400" /><span className={theme.textMuted}>Queue</span></div>
                            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className={theme.textMuted}>Visited</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-red-500" /><span className={theme.textMuted}>Active</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-yellow-400" /><span className={theme.textMuted}>Path</span></div>
                            <div className="hidden lg:flex ml-auto px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30">
                                <span className="font-semibold text-teal-400">{isDirected ? "Directed ↔" : "Undirected"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Pseudocode (wider with bigger font) */}
                <div className="w-full lg:w-96 flex flex-col flex-shrink-0">
                    <div className={`backdrop-blur-sm rounded-xl p-4 border flex-1 overflow-y-auto ${theme.panel}`}>
                        <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Pseudocode
                        </h3>


                        <div className={`rounded-lg p-4 border font-mono text-sm leading-relaxed transition-colors ${theme.codeBg}`}>
                            {PSEUDOCODE.map((line, idx) => {
                                const isActive =
                                    stepMap[dijkstraState.stepType]?.includes(line.step);


                                return (
                                    <div
                                        key={idx}
                                        className={`py-1 px-2 rounded transition-all ${isActive
                                            ? isDarkMode
                                                ? "bg-blue-500/40 text-blue-100 font-bold border-l-4 border-blue-400"
                                                : "bg-blue-200 text-blue-900 font-bold border-l-4 border-blue-600 shadow-sm"
                                            : isDarkMode ? "text-slate-400" : "text-slate-600"
                                            }`}
                                        style={{ paddingLeft: `${line.indent * 20 + 12}px` }}
                                    >
                                        {line.text}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Build Graph Modal */}
            <AnimatePresence>
                {showBuildGraph && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowBuildGraph(false); setPendingEdge(null); }}>
                        <motion.div className={`rounded-2xl w-full max-w-4xl border ${theme.modal}`} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Build Graph</h2>
                                <button onClick={() => { setShowBuildGraph(false); setPendingEdge(null); }} className={`hover:text-red-400 text-2xl ${theme.textMuted}`}>×</button>
                            </div>

                            <div className={`px-6 py-2 text-sm border-b transition-colors ${theme.panel} ${theme.textLabel}`}>
                                1. <strong>Click</strong> a node to select (Yellow). 2. <strong>Click</strong> another node. 3. Enter <strong>weight</strong> and click Add. 4. Click <strong>Apply</strong>.
                            </div>

                            <div className={`relative mx-4 my-4 rounded-lg border ${theme.graphBg}`} style={{ height: '320px' }}>
                                <svg viewBox="0 0 800 320" className="w-full h-full">
                                    {buildEdges.map((edge, idx) => {
                                        const fromNode = buildNodes.find(n => n.id === edge.from);
                                        const toNode = buildNodes.find(n => n.id === edge.to);
                                        if (!fromNode || !toNode) return null;
                                        const midX = (fromNode.x + toNode.x) / 2;
                                        const midY = (fromNode.y + toNode.y) / 2;
                                        return (
                                            <g key={`build-edge-${idx}`}>
                                                <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} className="stroke-slate-500 stroke-[2]" markerEnd="url(#build-arrow)" />
                                                <circle cx={midX} cy={midY} r="12" className={`${isDarkMode ? 'fill-slate-800' : 'fill-white'} stroke-slate-500`} strokeWidth="1" />
                                                <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" className={`text-xs font-bold ${isDarkMode ? 'fill-white' : 'fill-slate-900'}`}>{edge.weight}</text>
                                            </g>
                                        );
                                    })}
                                    <defs>
                                        <marker id="build-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" className="fill-slate-500" />
                                        </marker>
                                    </defs>
                                    {buildNodes.map(node => (
                                        <g key={node.id} onClick={() => handleBuildNodeClick(node.id)} className="cursor-pointer">
                                            <circle cx={node.x} cy={node.y} r="26" className={`${selectedNode === node.id ? 'fill-yellow-400 stroke-yellow-300' : 'fill-slate-600 stroke-slate-400'} hover:fill-slate-500 transition-colors`} strokeWidth="3" />
                                            <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" className={`text-base font-bold pointer-events-none ${isDarkMode ? 'fill-white' : 'fill-slate-900'}`}>{node.label}</text>
                                        </g>
                                    ))}
                                </svg>

                                <AnimatePresence>
                                    {pendingEdge && (
                                        <motion.div className="absolute inset-0 flex items-center justify-center bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <motion.div className="bg-white rounded-xl p-5 shadow-2xl w-64" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                                                <h3 className="text-lg font-bold text-slate-900 mb-3">Add Edge</h3>
                                                <p className="text-sm text-slate-600 mb-4">
                                                    From {buildNodes.find(n => n.id === pendingEdge.from)?.label} → {buildNodes.find(n => n.id === pendingEdge.to)?.label}
                                                </p>
                                                <input
                                                    type="number"
                                                    placeholder="Weight"
                                                    value={edgeWeightInput}
                                                    onChange={(e) => setEdgeWeightInput(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                    min="1"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={cancelAddEdge} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100">Cancel</button>
                                                    <button onClick={confirmAddEdge} className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800">Add</button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex justify-between px-6 py-4 border-t border-white/10">
                                <button onClick={() => { setShowBuildGraph(false); setPendingEdge(null); }} className="px-5 py-2 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800">Cancel</button>
                                <button onClick={applyBuiltGraph} className="px-6 py-2 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-white">Apply</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theory Modal */}
            <AnimatePresence>
                {showTheory && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTheory(false)}>
                        <motion.div className={`rounded-2xl p-8 max-w-2xl w-full border shadow-2xl ${theme.modal}`} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Dijkstra's Algorithm</h2>
                                    <p className={`text-xs mt-1 font-medium tracking-widest uppercase ${theme.textMuted}`}>Core Fundamentals</p>
                                </div>
                                <button onClick={() => setShowTheory(false)} className={`p-2 rounded-full hover:bg-red-500/10 transition-colors ${theme.textMuted} hover:text-red-400`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className={`space-y-6 text-sm max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar ${theme.textLabel}`}>
                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" /> What is it?
                                    </h3>
                                    <p className="leading-relaxed">Dijkstra's algorithm is a greedy algorithm used to find the <strong className="text-emerald-400 text-base">Shortest Path</strong> from a starting vertex to all other vertices in a weighted graph (where weights represent distance or cost).</p>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-blue-500 rounded-full" /> Understanding the Algorithm State
                                    </h3>
                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                        <div>
                                            <p className="font-bold text-emerald-400 mb-1">Visited Set</p>
                                            <p className="text-xs opacity-80 leading-relaxed">Nodes where the shortest path is already finalized.</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-yellow-400 mb-1">Current Vertex</p>
                                            <p className="text-xs opacity-80 leading-relaxed">The active node being explored in the current step.</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-400 mb-1">Priority Queue</p>
                                            <p className="text-xs opacity-80 leading-relaxed">Ordered list of discovered nodes to visit next (closest first).</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-teal-400 mb-1">Distance Map</p>
                                            <p className="text-xs opacity-80 leading-relaxed">The best known distance from start to every node so far.</p>
                                        </div>
                                    </div>
                                </section>

                                <section className={`p-4 rounded-xl border-l-4 ${isDarkMode ? "bg-red-500/10 border-red-500/50" : "bg-red-50 border-red-200"}`}>
                                    <h3 className="text-base font-bold mb-2 text-red-400 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                        The Negative Weight Problem
                                    </h3>
                                    <p className="text-xs md:text-sm leading-relaxed mb-2 opacity-90 italic">Dijkstra cannot be used with negative weights because it is a <strong>Greedy</strong> algorithm.</p>
                                    <p className="text-xs md:text-sm leading-relaxed opacity-90">It assumes that once a node is added to the <strong>Visited Set</strong>, its shortest path is found. However, a negative edge discovered later could create a "shortcut" that makes a previously finalized path longer than the new one, breaking the logic. For graphs with negative weights, <strong>Bellman-Ford</strong> should be used instead.</p>
                                </section>

                                <section>
                                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                        <div className="w-1.5 h-4 bg-purple-500 rounded-full" /> Complexity
                                    </h3>
                                    <p className="font-mono text-emerald-400 text-base">O((V + E) log V)</p>
                                </section>
                            </div>

                            <button onClick={() => setShowTheory(false)} className={`mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all`}>
                                Close Theory
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}