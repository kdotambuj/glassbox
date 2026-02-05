"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const quizQuestions: Question[] = [
    {
        id: 1,
        question: "What type of algorithm is Dijkstra's Algorithm?",
        options: ["Divide and Conquer", "Dynamic Programming", "Greedy Algorithm", "Backtracking"],
        correctAnswer: 2,
        explanation: "Dijkstra's Algorithm is a greedy algorithm because it always selects the vertex with the minimum known distance at each step."
    },
    {
        id: 2,
        question: "What is the time complexity of Dijkstra's Algorithm with a binary heap?",
        options: ["O(V²)", "O(V + E)", "O((V + E) log V)", "O(E log V)"],
        correctAnswer: 2,
        explanation: "Using a binary heap/priority queue, Dijkstra's runs in O((V + E) log V) where V is vertices and E is edges."
    },
    {
        id: 3,
        question: "Why does Dijkstra's Algorithm fail with negative edge weights?",
        options: [
            "It causes infinite loops",
            "Negative weights are mathematically impossible",
            "Once a node is marked visited, its distance is finalized but a negative edge could later provide a shorter path",
            "The priority queue cannot store negative values"
        ],
        correctAnswer: 2,
        explanation: "Dijkstra's greedy approach assumes that once a node is visited, its shortest distance is found. Negative edges can violate this assumption by providing shorter paths after a node is already finalized."
    },
    {
        id: 4,
        question: "What data structure is commonly used to efficiently implement Dijkstra's Algorithm?",
        options: ["Stack", "Queue", "Priority Queue (Min-Heap)", "Linked List"],
        correctAnswer: 2,
        explanation: "A Priority Queue (Min-Heap) is used to efficiently extract the vertex with the minimum distance in O(log V) time."
    },
    {
        id: 5,
        question: "What is the initial distance value assigned to all vertices except the source in Dijkstra's Algorithm?",
        options: ["0", "-1", "1", "Infinity (∞)"],
        correctAnswer: 3,
        explanation: "All vertices except the source are initialized with distance infinity (∞), indicating they haven't been reached yet."
    },
    {
        id: 6,
        question: "What operation is performed when Dijkstra's Algorithm finds a shorter path to a vertex?",
        options: ["Deletion", "Edge Relaxation", "Vertex Removal", "Graph Contraction"],
        correctAnswer: 1,
        explanation: "Edge Relaxation is the process of updating a vertex's distance if a shorter path is found through the current vertex."
    },
    {
        id: 7,
        question: "Which of the following is a real-world application of Dijkstra's Algorithm?",
        options: [
            "Sorting an array",
            "GPS Navigation Systems",
            "Binary Search",
            "Finding Maximum Element"
        ],
        correctAnswer: 1,
        explanation: "GPS navigation systems use Dijkstra's Algorithm (or variants like A*) to find the shortest route between locations."
    },
    {
        id: 8,
        question: "What is the space complexity of Dijkstra's Algorithm?",
        options: ["O(1)", "O(E)", "O(V)", "O(V²)"],
        correctAnswer: 2,
        explanation: "Dijkstra's Algorithm requires O(V) space for storing distances, previous pointers, and the priority queue."
    },
    {
        id: 9,
        question: "When does Dijkstra's Algorithm terminate?",
        options: [
            "After processing all edges",
            "When the priority queue becomes empty or the destination is reached",
            "After V iterations only",
            "When all edges are relaxed exactly once"
        ],
        correctAnswer: 1,
        explanation: "The algorithm terminates when the priority queue is empty (all reachable vertices processed) or when the destination vertex is extracted from the queue."
    },
    {
        id: 10,
        question: "What algorithm can be used instead of Dijkstra's when the graph has negative edge weights?",
        options: ["Prim's Algorithm", "Kruskal's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall only"],
        correctAnswer: 2,
        explanation: "The Bellman-Ford Algorithm can handle negative edge weights and also detect negative cycles in a graph."
    },
    {
        id: 11,
        question: "In Dijkstra's Algorithm, what does it mean when a vertex is 'visited' or 'finalized'?",
        options: [
            "The vertex has been removed from the graph",
            "The shortest path to that vertex has been determined",
            "The vertex has at least one edge",
            "The vertex is the source"
        ],
        correctAnswer: 1,
        explanation: "When a vertex is marked as visited/finalized, it means the algorithm has determined its shortest distance from the source and it won't be updated again."
    },
    {
        id: 12,
        question: "Which statement is TRUE about Dijkstra's Algorithm?",
        options: [
            "It finds the shortest path in unweighted graphs only",
            "It works on graphs with negative cycles",
            "It is a single-source shortest path algorithm",
            "It uses Depth-First Search traversal"
        ],
        correctAnswer: 2,
        explanation: "Dijkstra's is a single-source shortest path algorithm - it finds the shortest paths from one source vertex to all other vertices in the graph."
    }
];

export default function DijkstraQuiz() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(quizQuestions.length).fill(false));

    const handleAnswerSelect = (answerIndex: number) => {
        if (showExplanation) return; // Prevent changing answer after submission
        setSelectedAnswer(answerIndex);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        setShowExplanation(true);
        if (selectedAnswer === quizQuestions[currentQuestion].correctAnswer) {
            setScore(prev => prev + 1);
        }
        
        const newAnswered = [...answeredQuestions];
        newAnswered[currentQuestion] = true;
        setAnsweredQuestions(newAnswered);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setIsComplete(true);
        }
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setIsComplete(false);
        setAnsweredQuestions(new Array(quizQuestions.length).fill(false));
    };

    const getScoreMessage = () => {
        const percentage = (score / quizQuestions.length) * 100;
        if (percentage === 100) return { text: "Perfect Score! 🎉", color: "text-emerald-400" };
        if (percentage >= 80) return { text: "Excellent Work! 🌟", color: "text-emerald-400" };
        if (percentage >= 60) return { text: "Good Job! 👍", color: "text-teal-400" };
        if (percentage >= 40) return { text: "Keep Practicing! 📚", color: "text-amber-400" };
        return { text: "Review the Theory! 📖", color: "text-rose-400" };
    };

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
                    className="mb-8"
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Dijkstra&apos;s Algorithm Quiz</h1>
                            <p className="text-slate-400 mt-1">Test Your Understanding</p>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                                    <span>Score: {score}/{answeredQuestions.filter(Boolean).length}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                {/* Question dots */}
                                <div className="flex gap-1 mt-3 justify-center">
                                    {quizQuestions.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                idx === currentQuestion
                                                    ? "bg-emerald-500 scale-125"
                                                    : answeredQuestions[idx]
                                                    ? "bg-teal-500"
                                                    : "bg-slate-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Question Card */}
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 mb-6"
                            >
                                <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
                                    {quizQuestions[currentQuestion].question}
                                </h2>

                                <div className="space-y-3">
                                    {quizQuestions[currentQuestion].options.map((option, idx) => {
                                        const isSelected = selectedAnswer === idx;
                                        const isCorrect = idx === quizQuestions[currentQuestion].correctAnswer;
                                        const showResult = showExplanation;

                                        let optionClass = "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800";
                                        
                                        if (isSelected && !showResult) {
                                            optionClass = "bg-emerald-500/20 border-emerald-500";
                                        } else if (showResult) {
                                            if (isCorrect) {
                                                optionClass = "bg-emerald-500/20 border-emerald-500";
                                            } else if (isSelected && !isCorrect) {
                                                optionClass = "bg-rose-500/20 border-rose-500";
                                            }
                                        }

                                        return (
                                            <motion.button
                                                key={idx}
                                                onClick={() => handleAnswerSelect(idx)}
                                                disabled={showExplanation}
                                                whileHover={!showExplanation ? { scale: 1.01 } : {}}
                                                whileTap={!showExplanation ? { scale: 0.99 } : {}}
                                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${optionClass} ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                                                        isSelected && !showResult
                                                            ? "bg-emerald-500 text-white"
                                                            : showResult && isCorrect
                                                            ? "bg-emerald-500 text-white"
                                                            : showResult && isSelected && !isCorrect
                                                            ? "bg-rose-500 text-white"
                                                            : "bg-slate-700 text-slate-300"
                                                    }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="text-slate-200 flex-1">{option}</span>
                                                    {showResult && isCorrect && (
                                                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                    {showResult && isSelected && !isCorrect && (
                                                        <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                <AnimatePresence>
                                    {showExplanation && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-blue-400 mb-1">Explanation</p>
                                                    <p className="text-sm text-slate-300 leading-relaxed">
                                                        {quizQuestions[currentQuestion].explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                {!showExplanation ? (
                                    <motion.button
                                        onClick={handleSubmitAnswer}
                                        disabled={selectedAnswer === null}
                                        whileHover={selectedAnswer !== null ? { scale: 1.02 } : {}}
                                        whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
                                        className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                                            selectedAnswer !== null
                                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                        }`}
                                    >
                                        Submit Answer
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={handleNextQuestion}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                                    >
                                        {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "View Results"}
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* Results Screen */
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                            >
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </motion.div>

                            <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${getScoreMessage().color}`}>
                                {getScoreMessage().text}
                            </h2>
                            <p className="text-slate-400 mb-8">You completed the quiz!</p>

                            <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
                                <div className="text-6xl font-bold text-white mb-2">
                                    {score}/{quizQuestions.length}
                                </div>
                                <p className="text-slate-400">
                                    {Math.round((score / quizQuestions.length) * 100)}% Correct
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.button
                                    onClick={handleRetry}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                                >
                                    Retry Quiz
                                </motion.button>
                                <Link href="/dijkstra/theory" className="flex-1">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="py-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
                                    >
                                        Review Theory
                                    </motion.div>
                                </Link>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Link
                                    href="/dijkstra/simulation"
                                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <span>Try the Simulation</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
