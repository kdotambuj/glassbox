"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BFSTheory() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-xl">
                            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="4" r="2" />
                                <circle cx="6" cy="10" r="2" />
                                <circle cx="18" cy="10" r="2" />
                                <circle cx="3" cy="16" r="2" />
                                <circle cx="9" cy="16" r="2" />
                                <circle cx="15" cy="16" r="2" />
                                <circle cx="21" cy="16" r="2" />
                                <path d="M12 6v2M6 12v2M18 12v2M12 8l-6 2M12 8l6 2M6 12l-3 4M6 12l3 4M18 12l-3 4M18 12l3 4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Breadth-First Search</h1>
                            <p className="text-slate-400 mt-1">Level-By-Level Graph Traversal</p>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Overview */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Breadth-First Search (BFS) is an algorithm for traversing or searching tree or graph data structures. It starts at the <span className="text-blue-400 font-medium">tree root</span> (or some arbitrary node of a graph) and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.
                        </p>
                    </motion.section>

                    {/* How It Works */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
                        <ol className="space-y-4 text-slate-300">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">1</span>
                                <div>
                                    <p className="font-medium text-white">Initialization</p>
                                    <p className="text-sm text-slate-400">Put the starting node into a queue and mark it as visited.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">2</span>
                                <div>
                                    <p className="font-medium text-white">Exploration</p>
                                    <p className="text-sm text-slate-400">Take the first node from the queue. For each unvisited neighbor, mark it as visited and add it to the queue.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">3</span>
                                <div>
                                    <p className="font-medium text-white">Back Path</p>
                                    <p className="text-sm text-slate-400">Identify the parent of each node to reconstruct the path once the destination is found.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">4</span>
                                <div>
                                    <p className="font-medium text-white">Termination</p>
                                    <p className="text-sm text-slate-400">Continue until the queue is empty or the goal node is reached.</p>
                                </div>
                            </li>
                        </ol>
                    </motion.section>

                    {/* Pseudocode */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Pseudocode</h2>
                        <div className="bg-black/40 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                            <pre className="text-slate-300">
                                <code>{`function BFS(Graph, root):
    let Q be a queue
    label root as discovered
    Q.enqueue(root)
    while Q is not empty do
        v := Q.dequeue()
        if v is the goal then
            return v
        for all edges from v to w in G.adjacentEdges(v) do
            if w is not labeled as discovered then
                label w as discovered
                w.parent := v
                Q.enqueue(w)`}</code>
                            </pre>
                        </div>
                    </motion.section>

                    {/* Complexity */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Complexity Analysis</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-slate-400 text-sm mb-1">Time Complexity</p>
                                <p className="text-2xl font-mono text-white">O(V + E)</p>
                                <p className="text-xs text-slate-500 mt-2">V is vertices, E is edges</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-slate-400 text-sm mb-1">Space Complexity</p>
                                <p className="text-2xl font-mono text-white">O(V)</p>
                                <p className="text-xs text-slate-500 mt-2">To store the queue and visited set</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Key Properties */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Key Properties</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Shortest Path</p>
                                    <p className="text-sm text-slate-400">Guarantees shortest path in unweighted graphs</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Completeness</p>
                                    <p className="text-sm text-slate-400">Will find a solution if one exists</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Level Order</p>
                                    <p className="text-sm text-slate-400">Explores nodes layer by layer</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Queue Based</p>
                                    <p className="text-sm text-slate-400">Uses FIFO (First-In First-Out) strategy</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Applications */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Real-World Applications</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                { name: "Social Networks", desc: "Finding people within 'k' distance" },
                                { name: "Web Crawlers", desc: "Indexing pages layer by layer" },
                                { name: "P2P Networks", desc: "Finding neighboring nodes" },
                                { name: "Broadcasting", desc: "Sending packets in a network" },
                            ].map((app) => (
                                <div key={app.name} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <div>
                                        <p className="text-white text-sm font-medium">{app.name}</p>
                                        <p className="text-slate-500 text-xs">{app.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <Link
                            href="/bfs/game"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Explore Game
                        </Link>
                        <Link
                            href="/bfs/simulation"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            View Simulation
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
