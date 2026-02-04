"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DijkstraTheory() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl" />
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl">
                            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="4" cy="12" r="2" />
                                <circle cx="12" cy="4" r="2" />
                                <circle cx="20" cy="12" r="2" />
                                <circle cx="12" cy="20" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <path d="M6 12h4M14 12h4M12 6v4M12 14v4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Dijkstra&apos;s Algorithm</h1>
                            <p className="text-slate-400 mt-1">Shortest Path Finding Algorithm</p>
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
                            Dijkstra&apos;s algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph with <span className="text-emerald-400 font-medium">non-negative edge weights</span>. Invented by Edsger W. Dijkstra in 1956, it&apos;s one of the most fundamental algorithms in computer science.
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
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-semibold">1</span>
                                <div>
                                    <p className="font-medium text-white">Initialize</p>
                                    <p className="text-sm text-slate-400">Set distance to source = 0, all others = ∞. Add source to priority queue.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-semibold">2</span>
                                <div>
                                    <p className="font-medium text-white">Extract Minimum</p>
                                    <p className="text-sm text-slate-400">Remove vertex with smallest distance from priority queue.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-semibold">3</span>
                                <div>
                                    <p className="font-medium text-white">Relax Edges</p>
                                    <p className="text-sm text-slate-400">For each neighbor: if current distance + edge weight &lt; neighbor&apos;s distance, update it.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-semibold">4</span>
                                <div>
                                    <p className="font-medium text-white">Repeat</p>
                                    <p className="text-sm text-slate-400">Continue until priority queue is empty or destination is reached.</p>
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
                                <code>{`function Dijkstra(Graph, source):
    dist[source] ← 0
    for each vertex v in Graph:
        if v ≠ source:
            dist[v] ← INFINITY
        add v to PriorityQueue

    while PriorityQueue is not empty:
        u ← vertex with min dist[]
        remove u from PriorityQueue

        for each neighbor v of u:
            alt ← dist[u] + weight(u, v)
            if alt < dist[v]:
                dist[v] ← alt

    return dist[]`}</code>
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
                                <p className="text-2xl font-mono text-white">O((V + E) log V)</p>
                                <p className="text-xs text-slate-500 mt-2">Using binary heap / priority queue</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-slate-400 text-sm mb-1">Space Complexity</p>
                                <p className="text-2xl font-mono text-white">O(V)</p>
                                <p className="text-xs text-slate-500 mt-2">For distance array and priority queue</p>
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
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Greedy Algorithm</p>
                                    <p className="text-sm text-slate-400">Always picks the minimum distance vertex</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Optimal Solution</p>
                                    <p className="text-sm text-slate-400">Guaranteed shortest path (non-negative weights)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Limitation</p>
                                    <p className="text-sm text-slate-400">Doesn&apos;t work with negative edge weights</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Single Source</p>
                                    <p className="text-sm text-slate-400">Finds paths from one source to all vertices</p>
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
                                { name: "GPS Navigation", desc: "Finding shortest driving routes" },
                                { name: "Network Routing", desc: "OSPF protocol in computer networks" },
                                { name: "Flight Planning", desc: "Optimal airline routes" },
                                { name: "Robotics", desc: "Path planning for autonomous robots" },
                            ].map((app) => (
                                <div key={app.name} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <div>
                                        <p className="text-white text-sm font-medium">{app.name}</p>
                                        <p className="text-slate-500 text-xs">{app.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Game Procedure */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">Game Procedure</h2>
                        </div>
                        <ol className="space-y-2 text-sm">
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-emerald-400 font-semibold">1.</span>
                                Select a starting city and destination city on the map
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-emerald-400 font-semibold">2.</span>
                                Click on neighboring cities to build your path
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-emerald-400 font-semibold">3.</span>
                                Each edge has a distance cost shown on the connection
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-emerald-400 font-semibold">4.</span>
                                Try to reach the destination with minimum total distance
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-emerald-400 font-semibold">5.</span>
                                Compare your path with the optimal Dijkstra solution
                            </li>
                        </ol>
                    </motion.section>

                    {/* Simulation Procedure */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white">Simulation Procedure</h2>
                        </div>
                        <ol className="space-y-2 text-sm">
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-purple-400 font-semibold">1.</span>
                                Choose number of vertices (4-8) for the graph
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-purple-400 font-semibold">2.</span>
                                Select source and destination nodes
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-purple-400 font-semibold">3.</span>
                                Press Play for auto-run or Step for manual control
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-purple-400 font-semibold">4.</span>
                                Watch the distance table update as nodes are visited
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-purple-400 font-semibold">5.</span>
                                Follow the highlighted pseudocode for current step
                            </li>
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-purple-400 font-semibold">6.</span>
                                See the final shortest path highlighted in green
                            </li>
                        </ol>
                    </motion.section>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <Link
                            href="/dijkstra/game"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Play Game
                        </Link>
                        <Link
                            href="/dijkstra/simulation"
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
