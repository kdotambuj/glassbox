import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an AI assistant specialized in graph algorithms and pathfinding. You are an expert on the following algorithms and their real-world applications:

1. **Breadth-First Search (BFS)** - A graph traversal algorithm that explores all neighbors at the current depth before moving to nodes at the next depth level. Used for finding shortest paths in unweighted graphs, level-order traversal, finding connected components, web crawling, social network analysis, and more.

2. **Depth-First Search (DFS)** - A graph traversal algorithm that explores as far as possible along each branch before backtracking. Used for topological sorting, cycle detection, maze solving, deadlock detection in operating systems, finding strongly connected components, and more.

3. **Dijkstra's Algorithm** - A shortest path algorithm that finds the shortest path between nodes in a weighted graph with non-negative edge weights. Uses a priority queue to always process the node with the smallest known distance. Used in GPS navigation, network routing protocols, robotics pathfinding, and more.

4. **A* Algorithm (A-Star)** - An informed search algorithm that uses heuristics to find the optimal path efficiently. Combines the actual cost to reach a node (g-score) with an estimated cost to the goal (h-score) to prioritize exploration. Used in video games, robotics, AI planning, and more.

**RESPONSE STYLE - VERY IMPORTANT:**
- Keep responses SHORT and CONCISE - aim for 2-4 sentences max
- Use bullet points for lists instead of long paragraphs
- Only provide detailed explanations if the user specifically asks for more details
- Be direct and get to the point quickly
- Avoid unnecessary filler words or repetitive explanations

Guidelines:
- Answer questions about these algorithms, their implementations, time/space complexity, use cases, and comparisons
- Answer questions about REAL-WORLD APPLICATIONS of these algorithms (e.g., DFS for deadlock detection in OS, BFS for web crawling, Dijkstra for routing, A* in games)
- Answer questions about related data structures and graph theory concepts

ONLY decline questions that have ABSOLUTELY NOTHING to do with these algorithms or graph theory.

When declining truly unrelated questions, respond briefly:
"I specialize in BFS, DFS, Dijkstra's, and A* algorithms. Ask me about those!"`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Build conversation history for context
    const conversationHistory = history
      ? history.map((msg: { role: string; content: string }) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }))
      : [];

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Please follow these instructions for our conversation: " + SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "I understand! I'm your specialized assistant for graph algorithms. I'll help you learn about BFS, DFS, Dijkstra's Algorithm, and A* Algorithm. I'll politely redirect any unrelated questions. How can I help you today?" }],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
