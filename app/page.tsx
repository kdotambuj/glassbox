"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const algorithms = [
  {
    id: "bfs",
    title: "Breadth-First Search",
    shortTitle: "BFS",
    description: "Explores all neighbors at the current depth before moving to nodes at the next depth level.",
    href: "/bfs",
    icon: (
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
    ),
    color: "from-blue-500 to-cyan-400",
    bgGlow: "bg-blue-500/20",
  },
  {
    id: "dfs",
    title: "Depth-First Search",
    shortTitle: "DFS",
    description: "Explores as far as possible along each branch before backtracking to explore other branches.",
    href: "/dfs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="3" r="2" />
        <circle cx="12" cy="9" r="2" />
        <circle cx="12" cy="15" r="2" />
        <circle cx="12" cy="21" r="2" />
        <circle cx="6" cy="15" r="2" />
        <circle cx="18" cy="9" r="2" />
        <path d="M12 5v2M12 11v2M12 17v2M10 15H8M14 9h2" />
      </svg>
    ),
    color: "from-purple-500 to-pink-400",
    bgGlow: "bg-purple-500/20",
  },
  {
    id: "dijkstra",
    title: "Dijkstra's Algorithm",
    shortTitle: "Dijkstra",
    description: "Finds the shortest path between nodes in a weighted graph with non-negative edge weights.",
    href: "/dijkstra",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <circle cx="4" cy="12" r="2" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="20" cy="12" r="2" />
        <circle cx="12" cy="20" r="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h4M14 12h4M12 6v4M12 14v4" />
        <path d="M6 10l4-4M14 6l4 4M14 18l4-4M6 14l4 4" strokeDasharray="2 2" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-400",
    bgGlow: "bg-emerald-500/20",
  },
  {
    id: "astar",
    title: "A* Algorithm",
    shortTitle: "A*",
    description: "An informed search algorithm that uses heuristics to find the optimal path efficiently.",
    href: "/astar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-400",
    bgGlow: "bg-amber-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
} as const;

export default function Home() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl opacity-60"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl opacity-60"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 rounded-full blur-3xl opacity-40"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">Interactive Visualizations</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Algorithm Visualizer
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Explore and understand pathfinding algorithms through beautiful,
            interactive visualizations
          </motion.p>
        </motion.div>

        {/* Algorithm Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {algorithms.map((algo) => (
            <Link key={algo.id} href={algo.href}>
              <motion.div
                variants={itemVariants}
                onHoverStart={() => setHoveredId(algo.id)}
                onHoverEnd={() => setHoveredId(null)}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full"
              >
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-black/20 border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:bg-white/10 h-full">
                  {/* Glow effect on hover */}
                  <motion.div
                    className={`absolute inset-0 ${algo.bgGlow} blur-2xl`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: hoveredId === algo.id ? 0.5 : 0,
                      scale: hoveredId === algo.id ? 1.2 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="relative z-10">
                    {/* Icon with gradient background */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${algo.color} text-white mb-5 shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {algo.icon}
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors">
                      {algo.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">
                      {algo.description}
                    </p>

                    {/* CTA Button */}
                    <motion.div
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r ${algo.color} text-white font-medium text-sm shadow-md`}
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Visualize {algo.shortTitle}</span>
                      <motion.svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ x: hoveredId === algo.id ? 4 : 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>
                    </motion.div>
                  </div>

                  {/* Decorative corner element */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${algo.color} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Footer text */}
        <motion.p
          className="text-center text-slate-500 text-sm mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Click on any algorithm to start exploring
        </motion.p>
      </div>
    </div>
  );
}
