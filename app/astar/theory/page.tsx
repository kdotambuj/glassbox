"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AStarTheory() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-900/20 rounded-full blur-3xl" />
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-xl">
                            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">A* Search Algorithm</h1>
                            <p className="text-slate-400 mt-1">Informed Heuristic Search</p>
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
                            A* (A-star) is a graph traversal and pathfinding algorithm, which is both complete and optimal. It uses a <span className="text-amber-400 font-medium">heuristic function</span> to guide the search, making it much more efficient than Dijkstra in most cases while still finding the shortest path.
                        </p>
                    </motion.section>

                    {/* The Formula */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">The A* Formula</h2>
                        <div className="bg-black/40 rounded-xl p-6 text-center mb-4">
                            <p className="text-3xl font-mono text-white tracking-widest">f(n) = g(n) + h(n)</p>
                        </div>
                        <div className="space-y-3 text-sm">
                            <p className="text-slate-300"><span className="text-amber-400 font-bold">g(n):</span> The cost of the path from the start node to n.</p>
                            <p className="text-slate-300"><span className="text-amber-400 font-bold">h(n):</span> The heuristic cost estimate from n to the goal.</p>
                            <p className="text-slate-300"><span className="text-amber-400 font-bold">f(n):</span> The total estimated cost of path through node n to the goal.</p>
                        </div>
                    </motion.section>

                    {/* How It Works */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
                        <ol className="space-y-4 text-slate-300">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-semibold">1</span>
                                <div>
                                    <p className="font-medium text-white">Initialize Open Set</p>
                                    <p className="text-sm text-slate-400">Put the starting node in the Open Set (priority queue) with f(start) = h(start).</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-semibold">2</span>
                                <div>
                                    <p className="font-medium text-white">Find Best Node</p>
                                    <p className="text-sm text-slate-400">Pop node 'n' with the lowest f(n) from the Open Set.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-semibold">3</span>
                                <div>
                                    <p className="font-medium text-white">Evaluate Neighbors</p>
                                    <p className="text-sm text-slate-400">For each neighbor, calculate its g value. If it's a better path than previously found, update and add to Open Set.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-semibold">4</span>
                                <div>
                                    <p className="font-medium text-white">Admissibility</p>
                                    <p className="text-sm text-slate-400">The heuristic h(n) must be 'admissible' (never overestimate the cost) to guarantee the shortest path.</p>
                                </div>
                            </li>
                        </ol>
                    </motion.section>

                    {/* Complexity */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Complexity Analysis</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-slate-400 text-sm mb-1">Time Complexity</p>
                                <p className="text-2xl font-mono text-white">O(E log V)</p>
                                <p className="text-xs text-slate-500 mt-2">Highly dependent on the heuristic quality</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4">
                                <p className="text-slate-400 text-sm mb-1">Space Complexity</p>
                                <p className="text-2xl font-mono text-white">O(V)</p>
                                <p className="text-xs text-slate-500 mt-2">To store nodes in the Open and Closed sets</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Applications */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Real-World Applications</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                { name: "Video Games", desc: "NPC pathfinding and obstacle avoidance" },
                                { name: "Robotics", desc: "Efficient movement in mapped environments" },
                                { name: "Traffic Flow", desc: "Dynamic route optimization" },
                                { name: "Character AI", desc: "Complex decision-making paths" },
                            ].map((app) => (
                                <div key={app.name} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
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
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <Link
                            href="/astar/game"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Explore Game
                        </Link>
                        <Link
                            href="/astar/simulation"
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
