# Glassbox - Architecture Documentation

This directory contains PlantUML diagrams documenting the architecture and process flow of the Glassbox algorithm visualization platform.

## 📁 Diagrams

| File | Description |
|------|-------------|
| [overview.puml](overview.puml) | Simple high-level overview of the platform |
| [architecture.puml](architecture.puml) | Detailed system architecture |
| [component-diagram.puml](component-diagram.puml) | Component relationships and data flow |
| [user-flow.puml](user-flow.puml) | User journey activity diagram |
| [process-sequence.puml](process-sequence.puml) | Step-by-step execution sequence |

## 🚀 How to View

### Option 1: VS Code Extension
Install the **PlantUML** extension in VS Code:
```
ext install jebbs.plantuml
```
Then right-click any `.puml` file → **Preview Current Diagram**

### Option 2: Online Viewer
1. Go to [PlantUML Web Server](https://www.plantuml.com/plantuml/uml/)
2. Copy-paste the content of any `.puml` file
3. Click "Submit" to render

### Option 3: Command Line
```bash
# Install PlantUML
brew install plantuml  # macOS
sudo apt install plantuml  # Ubuntu

# Generate PNG
plantuml docs/*.puml

# Generate SVG
plantuml -tsvg docs/*.puml
```

## 📊 Project Overview

**Glassbox** is an interactive algorithm visualization platform for learning graph traversal and pathfinding algorithms:

- **BFS** (Breadth-First Search) - Queue-based level-order traversal
- **DFS** (Depth-First Search) - Stack/recursive depth exploration  
- **Dijkstra's Algorithm** - Weighted shortest path with priority queue
- **A\* Algorithm** - Heuristic-based optimal pathfinding

### Key Features
- 🎯 Step-by-step algorithm execution
- 📝 Synchronized pseudocode highlighting
- 🎨 Animated graph visualization with D3.js
- 🎮 Interactive India map game (Dijkstra)
- 📚 Theory explanations with complexity analysis

### Tech Stack
- Next.js 16 (App Router)
- React 19
- D3.js (Visualization)
- Framer Motion (Animations)
- TailwindCSS 4 (Styling)
