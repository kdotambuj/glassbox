"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";

// SVG Icons
const Icons = {
    arrowLeft: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    play: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    pause: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
    ),
    refresh: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    check: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    lightbulb: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    chart: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    table: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    book: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    trophy: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15l-2 5h4l-2-5zm0 0V9m-4-4h8m-8 0V3h8v2m-8 0H4a1 1 0 00-1 1v2a4 4 0 004 4h1m8-7h4a1 1 0 011 1v2a4 4 0 01-4 4h-1" />
        </svg>
    ),
    rocket: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
    ),
    route: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    arrowRight: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    ),
    building: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    monument: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L8 6v2H6v2H4v10h16V10h-2V8h-2V6l-4-4zM9 14h2v6H9v-6zm4 0h2v6h-2v-6z" />
        </svg>
    ),
    map: (
        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    eye: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    eyeOff: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ),
};

// Types
interface Node {
    id: string;
    name: string;
    x: number;
    y: number;
}

interface Edge {
    from: string;
    to: string;
    weight: number;
}

interface Graph {
    nodes: Node[];
    edges: Edge[];
}

interface DijkstraStep {
    currentNode: string;
    priorityQueue: { node: string; distance: number }[];
    distances: Record<string, number>;
    visited: string[];
    previous: Record<string, string | null>;
    explanation: string;
}

// Level 1: DEI College Map
const deiGraph: Graph = {
    nodes: [
        { id: "gate", name: "Main Gate", x: 80, y: 220 },
        { id: "admin", name: "Admin Block", x: 200, y: 120 },
        { id: "library", name: "Library", x: 200, y: 320 },
        { id: "canteen", name: "Canteen", x: 350, y: 220 },
        { id: "cs", name: "CS Dept", x: 480, y: 120 },
        { id: "ee", name: "EE Dept", x: 480, y: 320 },
        { id: "hostel", name: "Hostel", x: 600, y: 220 },
    ],
    edges: [
        { from: "gate", to: "admin", weight: 3 },
        { from: "gate", to: "library", weight: 4 },
        { from: "admin", to: "canteen", weight: 2 },
        { from: "library", to: "canteen", weight: 3 },
        { from: "admin", to: "cs", weight: 5 },
        { from: "canteen", to: "cs", weight: 2 },
        { from: "canteen", to: "ee", weight: 3 },
        { from: "library", to: "ee", weight: 4 },
        { from: "cs", to: "hostel", weight: 2 },
        { from: "ee", to: "hostel", weight: 3 },
    ],
};

// Level 2: Agra City Map
const agraGraph: Graph = {
    nodes: [
        { id: "taj", name: "Taj Mahal", x: 120, y: 180 },
        { id: "fort", name: "Agra Fort", x: 240, y: 90 },
        { id: "mehtab", name: "Mehtab Bagh", x: 120, y: 320 },
        { id: "kinari", name: "Kinari Bazaar", x: 300, y: 220 },
        { id: "sikandra", name: "Sikandra", x: 420, y: 80 },
        { id: "fatehpur", name: "Fatehpur Sikri", x: 560, y: 140 },
        { id: "itmad", name: "Itmad-ud-Daulah", x: 220, y: 380 },
        { id: "wildlife", name: "Wildlife SOS", x: 460, y: 280 },
        { id: "dayal", name: "Dayal Bagh", x: 380, y: 400 },
        { id: "station", name: "Agra Cantt", x: 560, y: 360 },
    ],
    edges: [
        { from: "taj", to: "fort", weight: 4 },
        { from: "taj", to: "mehtab", weight: 2 },
        { from: "taj", to: "kinari", weight: 3 },
        { from: "fort", to: "kinari", weight: 2 },
        { from: "fort", to: "sikandra", weight: 6 },
        { from: "mehtab", to: "itmad", weight: 3 },
        { from: "kinari", to: "wildlife", weight: 5 },
        { from: "sikandra", to: "fatehpur", weight: 8 },
        { from: "sikandra", to: "wildlife", weight: 4 },
        { from: "itmad", to: "dayal", weight: 4 },
        { from: "wildlife", to: "fatehpur", weight: 5 },
        { from: "wildlife", to: "dayal", weight: 3 },
        { from: "wildlife", to: "station", weight: 4 },
        { from: "dayal", to: "station", weight: 5 },
        { from: "fatehpur", to: "station", weight: 7 },
    ],
};

// Level 3: India Map - Cities with lat/lng coordinates for D3 projection
// x, y will be calculated from lat/lng using D3's mercator projection
const indiaGraph: Graph = {
    nodes: [
        // Northern India
        { id: "delhi", name: "Delhi", x: 0, y: 0 },
        // Eastern India
        { id: "kolkata", name: "Kolkata", x: 0, y: 0 },
        // Western India
        { id: "mumbai", name: "Mumbai", x: 0, y: 0 },
        // Central India
        { id: "bhopal", name: "Bhopal", x: 0, y: 0 },
        // Southern India
        { id: "hyderabad", name: "Hyderabad", x: 0, y: 0 },
        { id: "bangalore", name: "Bangalore", x: 0, y: 0 },
        { id: "chennai", name: "Chennai", x: 0, y: 0 },
    ],
    edges: [
        { from: "delhi", to: "bhopal", weight: 780 },
        { from: "delhi", to: "kolkata", weight: 1450 },
        { from: "bhopal", to: "mumbai", weight: 780 },
        { from: "bhopal", to: "hyderabad", weight: 700 },
        { from: "bhopal", to: "kolkata", weight: 1100 },
        { from: "mumbai", to: "hyderabad", weight: 710 },
        { from: "hyderabad", to: "bangalore", weight: 570 },
        { from: "hyderabad", to: "chennai", weight: 630 },
        { from: "bangalore", to: "chennai", weight: 350 },
        { from: "kolkata", to: "chennai", weight: 1670 },
    ],
};

// City coordinates (lat, lng) for D3 projection
const indiaCityCoords: Record<string, { lat: number; lng: number }> = {
    delhi: { lat: 28.6139, lng: 77.2090 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    bhopal: { lat: 23.2599, lng: 77.4126 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    chennai: { lat: 13.0827, lng: 80.2707 },
};

// Dijkstra Algorithm with step recording
function runDijkstra(
    graph: Graph,
    start: string,
    end: string
): DijkstraStep[] {
    const steps: DijkstraStep[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited: string[] = [];
    const priorityQueue: { node: string; distance: number }[] = [];

    // Initialize
    graph.nodes.forEach((node) => {
        distances[node.id] = node.id === start ? 0 : Infinity;
        previous[node.id] = null;
    });

    priorityQueue.push({ node: start, distance: 0 });

    steps.push({
        currentNode: start,
        priorityQueue: [...priorityQueue],
        distances: { ...distances },
        visited: [...visited],
        previous: { ...previous },
        explanation: `Starting Dijkstra from "${graph.nodes.find((n) => n.id === start)?.name}". Initialize source distance to 0, all others to infinity.`,
    });

    while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.distance - b.distance);
        const current = priorityQueue.shift()!;

        if (visited.includes(current.node)) continue;
        visited.push(current.node);

        const currentNodeName = graph.nodes.find((n) => n.id === current.node)?.name;

        if (current.node === end) {
            steps.push({
                currentNode: current.node,
                priorityQueue: [...priorityQueue],
                distances: { ...distances },
                visited: [...visited],
                previous: { ...previous },
                explanation: `Destination "${currentNodeName}" reached. Shortest distance: ${distances[end]}`,
            });
            break;
        }

        const neighbors = graph.edges
            .filter((e) => e.from === current.node || e.to === current.node)
            .map((e) => ({
                node: e.from === current.node ? e.to : e.from,
                weight: e.weight,
            }))
            .filter((n) => !visited.includes(n.node));

        let stepExplanation = `Processing "${currentNodeName}" (distance: ${distances[current.node]})\n`;

        neighbors.forEach((neighbor) => {
            const newDist = distances[current.node] + neighbor.weight;
            const neighborName = graph.nodes.find((n) => n.id === neighbor.node)?.name;

            if (newDist < distances[neighbor.node]) {
                const oldDist = distances[neighbor.node];
                distances[neighbor.node] = newDist;
                previous[neighbor.node] = current.node;
                priorityQueue.push({ node: neighbor.node, distance: newDist });

                stepExplanation += `  + "${neighborName}": ${oldDist === Infinity ? "∞" : oldDist} → ${newDist} (via ${currentNodeName})\n`;
            } else {
                stepExplanation += `  - "${neighborName}": Keep ${distances[neighbor.node]} (${newDist} not better)\n`;
            }
        });

        steps.push({
            currentNode: current.node,
            priorityQueue: [...priorityQueue].sort((a, b) => a.distance - b.distance),
            distances: { ...distances },
            visited: [...visited],
            previous: { ...previous },
            explanation: stepExplanation,
        });
    }

    return steps;
}

function getPath(previous: Record<string, string | null>, end: string): string[] {
    const path: string[] = [];
    let current: string | null = end;
    while (current) {
        path.unshift(current);
        current = previous[current];
    }
    return path;
}

interface LevelConfig {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    graph: Graph;
    start: string;
    end: string;
    challenge: string;
    hint: string;
}

const levels: LevelConfig[] = [
    {
        id: 1,
        title: "Level 1: DEI Campus",
        subtitle: "Dayalbagh Educational Institute",
        description: "Navigate through your college campus. Find the shortest path from Main Gate to Hostel.",
        graph: deiGraph,
        start: "gate",
        end: "hostel",
        challenge: "You are a new student at DEI. Find the shortest path from Main Gate to the Hostel.",
        hint: "Think about which intermediate stops give you the minimum total distance.",
    },
    {
        id: 2,
        title: "Level 2: Agra City",
        subtitle: "City of the Taj Mahal",
        description: "Explore Agra. Find the optimal route from Taj Mahal to Agra Cantt Station.",
        graph: agraGraph,
        start: "taj",
        end: "station",
        challenge: "You are a tourist in Agra. Find the shortest route from Taj Mahal to Agra Cantt railway station.",
        hint: "The algorithm always picks the unvisited node with smallest known distance. Watch the priority queue.",
    },
    {
        id: 3,
        title: "Level 3: India",
        subtitle: "Cross-Country Journey",
        description: "Master Dijkstra. Find the shortest route from Delhi to Chennai across India.",
        graph: indiaGraph,
        start: "delhi",
        end: "chennai",
        challenge: "Plan a cross-country trip from Delhi to Chennai. Find the optimal route.",
        hint: "Notice how the algorithm explores nodes in order of their distance from source, ensuring optimality.",
    },
];

// Simplified India SVG fallback (used when GeoJSON is loading)
function IndiaSVGPaths({ fill, stroke }: { fill: string; stroke: string }) {
    return (
        <g strokeWidth="1" strokeLinejoin="round">
            {/* Simplified India outline */}
            <path
                d="M265 95 L320 90 L370 100 L420 105 L460 120 L490 145 L510 175 L520 210 L525 250 L520 290 L530 330 L545 370 L555 410 L545 450 L525 480 L500 500 L470 515 L440 525 L410 540 L385 565 L365 595 L350 630 L340 670 L330 710 L315 750 L295 785 L275 815 L255 835 L240 845 L228 840 L222 820 L225 795 L235 765 L242 735 L240 700 L228 670 L210 645 L185 630 L160 620 L145 600 L140 575 L145 545 L155 515 L158 485 L150 455 L138 425 L130 395 L135 365 L150 338 L168 310 L180 280 L175 250 L168 220 L175 190 L195 165 L220 145 L250 130 L265 110 Z"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
            />
        </g>
    );
}

// Graph Visualization Component
function GraphVisualization({
    graph,
    currentStep,
    path,
    level,
}: {
    graph: Graph;
    currentStep: DijkstraStep | null;
    path: string[];
    level: number;
}) {
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [mapPaths, setMapPaths] = useState<string[]>([]);

    const svgWidth = 680;
    const svgHeight = level === 3 ? 580 : 450;

    // Create D3 projection for India
    const getProjection = useCallback(() => {
        return d3.geoMercator()
            .center([82, 22])
            .scale(850)
            .translate([svgWidth / 2, svgHeight / 2]);
    }, [svgWidth, svgHeight]);

    // Load GeoJSON data for Level 3
    useEffect(() => {
        if (level !== 3) return;

        fetch('/india.geojson')
            .then(response => response.json())
            .then((data: GeoJSON.FeatureCollection) => {
                setGeoData(data);
            })
            .catch(err => console.error('Failed to load GeoJSON:', err));
    }, [level]);

    // Generate map paths when geoData is loaded
    useEffect(() => {
        if (!geoData || level !== 3) return;

        const projection = getProjection();
        const pathGenerator = d3.geoPath().projection(projection);

        const paths = geoData.features.map(feature => {
            return pathGenerator(feature) || '';
        });

        setMapPaths(paths);
    }, [geoData, level, getProjection]);

    // Get node coordinates - use D3 projection for Level 3, otherwise use static coords
    const getNodeCoords = useCallback((nodeId: string): { x: number; y: number } => {
        if (level === 3 && indiaCityCoords[nodeId]) {
            const projection = getProjection();
            const coords = projection([indiaCityCoords[nodeId].lng, indiaCityCoords[nodeId].lat]);
            if (coords) {
                return { x: coords[0], y: coords[1] };
            }
        }
        // Fallback to static coordinates for levels 1 & 2
        const node = graph.nodes.find(n => n.id === nodeId);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
    }, [level, graph.nodes, getProjection]);

    const getNodeColor = (nodeId: string) => {
        if (!currentStep) return "fill-gray-400";
        if (nodeId === currentStep.currentNode) return "fill-amber-500";
        if (currentStep.visited.includes(nodeId)) return "fill-emerald-500";
        if (currentStep.priorityQueue.some((p) => p.node === nodeId)) return "fill-blue-500";
        return "fill-gray-400";
    };

    const getNodeStroke = (nodeId: string) => {
        if (!currentStep) return "stroke-gray-500";
        if (nodeId === currentStep.currentNode) return "stroke-amber-600";
        if (currentStep.visited.includes(nodeId)) return "stroke-emerald-600";
        if (currentStep.priorityQueue.some((p) => p.node === nodeId)) return "stroke-blue-600";
        return "stroke-gray-500";
    };

    const getEdgeColor = (from: string, to: string) => {
        if (path.length > 1) {
            for (let i = 0; i < path.length - 1; i++) {
                if (
                    (path[i] === from && path[i + 1] === to) ||
                    (path[i] === to && path[i + 1] === from)
                ) {
                    return "stroke-emerald-500";
                }
            }
        }
        if (!currentStep) return "stroke-black";
        if (currentStep.visited.includes(from) && currentStep.visited.includes(to)) {
            return "stroke-gray-700";
        }
        return "stroke-black";
    };

    const getEdgeWidth = (from: string, to: string) => {
        if (path.length > 1) {
            for (let i = 0; i < path.length - 1; i++) {
                if (
                    (path[i] === from && path[i + 1] === to) ||
                    (path[i] === to && path[i + 1] === from)
                ) {
                    return 2;
                }
            }
        }
        return 1;
    };

    // Muted state colors - subtle and professional
    const stateColors = [
        '#f5f5f5', '#f0f0f0', '#ebebeb', '#e5e5e5', '#e0e0e0',
        '#f5f5f5', '#f0f0f0', '#ebebeb', '#e5e5e5', '#e0e0e0',
        '#f5f5f5', '#f0f0f0', '#ebebeb', '#e5e5e5', '#e0e0e0',
        '#f5f5f5', '#f0f0f0', '#ebebeb', '#e5e5e5', '#e0e0e0',
    ];

    // Label positions for cities (outside map with leader lines)
    const labelPositions: Record<string, { labelX: number; labelY: number; anchor: 'start' | 'middle' | 'end' }> = {
        delhi: { labelX: -80, labelY: -20, anchor: 'end' },
        kolkata: { labelX: 80, labelY: -10, anchor: 'start' },
        mumbai: { labelX: -85, labelY: 0, anchor: 'end' },
        bhopal: { labelX: 75, labelY: -25, anchor: 'start' },
        hyderabad: { labelX: 80, labelY: 10, anchor: 'start' },
        bangalore: { labelX: -85, labelY: 10, anchor: 'end' },
        chennai: { labelX: 85, labelY: 40, anchor: 'start' },
    };

    // Check if map is still loading
    const isMapLoading = level === 3 && mapPaths.length === 0;

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                {/* Grid Background */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    </pattern>
                    {/* Gradient for India map */}
                    <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0fdf4" />
                        <stop offset="100%" stopColor="#dcfce7" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Loading state for Level 3 */}
                {level === 3 && isMapLoading && (
                    <g>
                        <rect x={svgWidth / 2 - 100} y={svgHeight / 2 - 30} width={200} height={60} rx={8} fill="#f9fafb" stroke="#e5e7eb" strokeWidth={1} />
                        <text x={svgWidth / 2} y={svgHeight / 2 + 5} textAnchor="middle" className="fill-gray-500 text-sm font-medium">
                            Map is loading...
                        </text>
                    </g>
                )}

                {/* India Map for Level 3 - D3 GeoJSON rendering */}
                {level === 3 && !isMapLoading && (
                    <g>
                        {/* Shadow layer */}
                        <g transform="translate(2, 2)" opacity="0.05">
                            {mapPaths.map((pathD, idx) => (
                                <path
                                    key={`shadow-${idx}`}
                                    d={pathD}
                                    fill="#000"
                                    stroke="none"
                                />
                            ))}
                        </g>

                        {/* Main map with muted state boundaries */}
                        {mapPaths.map((pathD, idx) => (
                            <path
                                key={`state-${idx}`}
                                d={pathD}
                                fill={stateColors[idx % stateColors.length]}
                                stroke="#d1d5db"
                                strokeWidth="0.5"
                                className="transition-all duration-200"
                            />
                        ))}

                        {/* Outer border */}
                        {mapPaths.map((pathD, idx) => (
                            <path
                                key={`border-${idx}`}
                                d={pathD}
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="0.8"
                                opacity="0.4"
                            />
                        ))}
                    </g>
                )}

                {/* Edges */}
                {(!isMapLoading || level !== 3) && graph.edges.map((edge, idx) => {
                    const fromCoords = level === 3 ? getNodeCoords(edge.from) : graph.nodes.find((n) => n.id === edge.from)!;
                    const toCoords = level === 3 ? getNodeCoords(edge.to) : graph.nodes.find((n) => n.id === edge.to)!;
                    const midX = (fromCoords.x + toCoords.x) / 2;
                    const midY = (fromCoords.y + toCoords.y) / 2;

                    return (
                        <g key={idx}>
                            <line
                                x1={fromCoords.x}
                                y1={fromCoords.y}
                                x2={toCoords.x}
                                y2={toCoords.y}
                                className={`${getEdgeColor(edge.from, edge.to)} transition-all duration-300`}
                                strokeWidth={getEdgeWidth(edge.from, edge.to)}
                            />
                            <rect
                                x={midX - 18}
                                y={midY - 10}
                                width={36}
                                height={20}
                                rx={4}
                                className="fill-white stroke-gray-200"
                                strokeWidth={1}
                            />
                            <text
                                x={midX}
                                y={midY + 5}
                                textAnchor="middle"
                                className="fill-gray-600 text-xs font-medium"
                            >
                                {edge.weight}
                            </text>
                        </g>
                    );
                })}

                {/* Nodes */}
                {(!isMapLoading || level !== 3) && graph.nodes.map((node) => {
                    const coords = level === 3 ? getNodeCoords(node.id) : { x: node.x, y: node.y };
                    const distance = currentStep?.distances[node.id];
                    const isStart = levels[level - 1].start === node.id;
                    const isEnd = levels[level - 1].end === node.id;
                    const nodeRadius = level === 3 ? 8 : 20;
                    const labelPos = level === 3 ? labelPositions[node.id] : null;

                    return (
                        <g key={node.id}>
                            {/* Leader line for Level 3 labels */}
                            {level === 3 && labelPos && (
                                <line
                                    x1={coords.x}
                                    y1={coords.y}
                                    x2={coords.x + labelPos.labelX * 0.7}
                                    y2={coords.y + labelPos.labelY * 0.7}
                                    stroke="#60a5fa"
                                    strokeWidth={1}
                                    opacity={0.8}
                                />
                            )}
                            {/* Node shadow */}
                            <circle
                                cx={coords.x + 1}
                                cy={coords.y + 1}
                                r={nodeRadius}
                                className="fill-gray-300 opacity-30"
                            />
                            {/* Node circle */}
                            <circle
                                cx={coords.x}
                                cy={coords.y}
                                r={nodeRadius}
                                className={`${getNodeColor(node.id)} ${getNodeStroke(node.id)} transition-all duration-300`}
                                strokeWidth={isStart || isEnd ? 2 : 1.5}
                            />
                            {/* Distance label inside node for Level 3 */}
                            {level === 3 && currentStep && (
                                <text
                                    x={coords.x}
                                    y={coords.y + 1}
                                    textAnchor="middle"
                                    className="fill-white font-bold"
                                    style={{ fontSize: '3px' }}
                                >
                                    {distance === Infinity ? "∞" : distance}
                                </text>
                            )}
                            {/* Node label for Level 1 & 2 (above node) */}
                            {level !== 3 && (
                                <text
                                    x={coords.x}
                                    y={coords.y - nodeRadius - 6}
                                    textAnchor="middle"
                                    className="fill-gray-700 text-xs font-semibold"
                                >
                                    {node.name}
                                </text>
                            )}
                            {/* External label with leader line for Level 3 */}
                            {level === 3 && labelPos && (
                                <g>
                                    <rect
                                        x={labelPos.anchor === 'end' ? coords.x + labelPos.labelX - 58 : coords.x + labelPos.labelX - 2}
                                        y={coords.y + labelPos.labelY - 10}
                                        width={60}
                                        height={18}
                                        rx={3}
                                        fill="white"
                                        stroke="#e5e7eb"
                                        strokeWidth={1}
                                        opacity={0.95}
                                    />
                                    <text
                                        x={labelPos.anchor === 'end' ? coords.x + labelPos.labelX - 5 : coords.x + labelPos.labelX + 5}
                                        y={coords.y + labelPos.labelY + 3}
                                        textAnchor={labelPos.anchor}
                                        className="fill-gray-700 font-semibold"
                                        style={{ fontSize: '9px' }}
                                    >
                                        {node.name}
                                    </text>
                                    {/* Start/End badge */}
                                    {(isStart || isEnd) && (
                                        <text
                                            x={labelPos.anchor === 'end' ? coords.x + labelPos.labelX - 55 : coords.x + labelPos.labelX + 55}
                                            y={coords.y + labelPos.labelY + 3}
                                            textAnchor={labelPos.anchor === 'end' ? 'start' : 'end'}
                                            className={isStart ? 'fill-emerald-600' : 'fill-rose-600'}
                                            style={{ fontSize: '7px', fontWeight: 'bold' }}
                                        >
                                            {isStart ? '●' : '◆'}
                                        </text>
                                    )}
                                </g>
                            )}
                            {/* Distance label for Level 1 & 2 */}
                            {level !== 3 && currentStep && (
                                <text
                                    x={coords.x}
                                    y={coords.y + 4}
                                    textAnchor="middle"
                                    className="fill-white text-xs font-bold"
                                >
                                    {distance === Infinity ? "∞" : distance}
                                </text>
                            )}
                            {/* Start indicator for Level 1 & 2 */}
                            {level !== 3 && isStart && (
                                <g>
                                    <rect
                                        x={coords.x - 18}
                                        y={coords.y + nodeRadius + 3}
                                        width={36}
                                        height={14}
                                        rx={3}
                                        className="fill-emerald-100 stroke-emerald-300"
                                        strokeWidth={1}
                                    />
                                    <text
                                        x={coords.x}
                                        y={coords.y + nodeRadius + 13}
                                        textAnchor="middle"
                                        className="fill-emerald-700 text-[9px] font-semibold"
                                    >
                                        START
                                    </text>
                                </g>
                            )}
                            {/* End indicator for Level 1 & 2 */}
                            {level !== 3 && isEnd && (
                                <g>
                                    <rect
                                        x={coords.x - 14}
                                        y={coords.y + nodeRadius + 3}
                                        width={28}
                                        height={14}
                                        rx={3}
                                        className="fill-rose-100 stroke-rose-300"
                                        strokeWidth={1}
                                    />
                                    <text
                                        x={coords.x}
                                        y={coords.y + nodeRadius + 13}
                                        textAnchor="middle"
                                        className="fill-rose-700 text-[9px] font-semibold"
                                    >
                                        END
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// Priority Queue Display
function PriorityQueueDisplay({
    queue,
    graph,
}: {
    queue: { node: string; distance: number }[];
    graph: Graph;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-gray-500">{Icons.chart}</span>
                Priority Queue (Min-Heap)
            </h3>
            {queue.length === 0 ? (
                <p className="text-sm text-gray-400">Queue is empty</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {queue.map((item, idx) => {
                        const nodeName = graph.nodes.find((n) => n.id === item.node)?.name;
                        return (
                            <div
                                key={`${item.node}-${idx}`}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${idx === 0
                                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                    : "bg-blue-50 text-blue-700"
                                    }`}
                            >
                                <span className="font-semibold">{nodeName}</span>
                                <span className="ml-2 text-xs opacity-75">d={item.distance}</span>
                            </div>
                        );
                    })}
                </div>
            )}
            <p className="mt-3 text-xs text-gray-500">
                The node with smallest distance is always processed first
            </p>
        </div>
    );
}

// Distance Table Display
function DistanceTable({
    distances,
    visited,
    previous,
    graph,
}: {
    distances: Record<string, number>;
    visited: string[];
    previous: Record<string, string | null>;
    graph: Graph;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-gray-500">{Icons.table}</span>
                Distance Table
            </h3>
            <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-100">
                            <th className="pb-2 font-medium">Node</th>
                            <th className="pb-2 font-medium">Distance</th>
                            <th className="pb-2 font-medium">Via</th>
                            <th className="pb-2 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {graph.nodes.map((node) => (
                            <tr key={node.id} className="border-t border-gray-50">
                                <td className="py-1.5 font-medium">{node.name}</td>
                                <td className="py-1.5">
                                    {distances[node.id] === Infinity ? "∞" : distances[node.id]}
                                </td>
                                <td className="py-1.5 text-gray-500">
                                    {previous[node.id]
                                        ? graph.nodes.find((n) => n.id === previous[node.id])?.name
                                        : "-"}
                                </td>
                                <td className="py-1.5">
                                    {visited.includes(node.id) ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600">
                                            <span className="h-3 w-3">{Icons.check}</span>
                                            Done
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Pending</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Main Component
export default function LearnPage() {
    const [currentLevel, setCurrentLevel] = useState(1);
    const [gameState, setGameState] = useState<"intro" | "playing" | "complete">("intro");
    const [steps, setSteps] = useState<DijkstraStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [autoPlaySpeed, setAutoPlaySpeed] = useState(1500);
    const [showHint, setShowHint] = useState(false);

    const level = levels[currentLevel - 1];
    const currentStep = steps[currentStepIndex] || null;
    const path = currentStep ? getPath(currentStep.previous, level.end) : [];
    const isLastStep = currentStepIndex === steps.length - 1;

    const startLevel = useCallback(() => {
        const dijkstraSteps = runDijkstra(level.graph, level.start, level.end);
        setSteps(dijkstraSteps);
        setCurrentStepIndex(0);
        setGameState("playing");
        setShowHint(false);
    }, [level]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            setGameState("complete");
            setIsAutoPlaying(false);
        }
    }, [currentStepIndex, steps.length]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
        }
    }, [currentStepIndex]);

    const resetLevel = useCallback(() => {
        setCurrentStepIndex(0);
        setGameState("intro");
        setIsAutoPlaying(false);
    }, []);

    const nextLevel = useCallback(() => {
        if (currentLevel < 3) {
            setCurrentLevel((prev) => prev + 1);
            setGameState("intro");
            setSteps([]);
            setCurrentStepIndex(0);
        }
    }, [currentLevel]);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex((prev) => prev + 1);
            } else {
                setIsAutoPlaying(false);
                setGameState("complete");
            }
        }, autoPlaySpeed);

        return () => clearInterval(timer);
    }, [isAutoPlaying, currentStepIndex, steps.length, autoPlaySpeed]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                    >
                        {Icons.arrowLeft}
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">Learn Dijkstra&apos;s Algorithm</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => {
                                    setCurrentLevel(lvl);
                                    setGameState("intro");
                                    setSteps([]);
                                    setCurrentStepIndex(0);
                                }}
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${currentLevel === lvl
                                    ? "bg-gray-900 text-white"
                                    : currentLevel > lvl
                                        ? "bg-emerald-500 text-white"
                                        : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                                    }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8 pb-24">
                {/* Intro State */}
                {gameState === "intro" && (
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                    {currentLevel === 1 ? Icons.building : currentLevel === 2 ? Icons.monument : Icons.map}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{level.challenge}</h3>
                                <p className="mt-2 text-gray-500">{level.description}</p>
                            </div>

                            <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-100">
                                <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-700">
                                    <span className="text-gray-500">{Icons.book}</span>
                                    How Dijkstra Works
                                </h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
                                    <li>Start with source node (distance = 0), all others = ∞</li>
                                    <li>Pick unvisited node with smallest known distance</li>
                                    <li>Update distances to all its unvisited neighbors</li>
                                    <li>Mark current node as visited</li>
                                    <li>Repeat until destination is reached</li>
                                </ol>
                            </div>

                            <button
                                onClick={startLevel}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-gray-800"
                            >
                                {Icons.rocket}
                                Start Level {currentLevel}
                            </button>
                        </div>
                    </div>
                )}

                {/* Playing State */}
                {gameState === "playing" && currentStep && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Graph Visualization */}
                        <div className="lg:col-span-2">
                            <GraphVisualization
                                graph={level.graph}
                                currentStep={currentStep}
                                path={isLastStep ? path : []}
                                level={currentLevel}
                            />

                            {/* Controls */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prevStep}
                                        disabled={currentStepIndex === 0}
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={isLastStep}
                                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isAutoPlaying
                                            ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            }`}
                                    >
                                        {isAutoPlaying ? Icons.pause : Icons.play}
                                        {isAutoPlaying ? "Pause" : "Auto Play"}
                                    </button>
                                    <select
                                        value={autoPlaySpeed}
                                        onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                    >
                                        <option value={2500}>Slow</option>
                                        <option value={1500}>Normal</option>
                                        <option value={800}>Fast</option>
                                    </select>
                                </div>

                                <div className="text-sm text-gray-500 font-medium">
                                    Step {currentStepIndex + 1} / {steps.length}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                                    <span>Current Node</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                                    <span>Visited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                                    <span>In Queue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                                    <span>Unvisited</span>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-4">
                            {/* Current Step Explanation */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <span className="text-gray-500">{Icons.lightbulb}</span>
                                    Current Step
                                </h3>
                                <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700 font-mono border border-gray-100">
                                    {currentStep.explanation}
                                </div>
                            </div>

                            <PriorityQueueDisplay queue={currentStep.priorityQueue} graph={level.graph} />
                            <DistanceTable
                                distances={currentStep.distances}
                                visited={currentStep.visited}
                                previous={currentStep.previous}
                                graph={level.graph}
                            />

                            <button
                                onClick={() => setShowHint(!showHint)}
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                            >
                                {showHint ? Icons.eyeOff : Icons.eye}
                                {showHint ? "Hide Hint" : "Show Hint"}
                            </button>
                            {showHint && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                    {level.hint}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Complete State */}
                {gameState === "complete" && currentStep && (
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                {Icons.trophy}
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900">Level {currentLevel} Complete</h3>
                            <p className="mt-2 text-lg text-gray-600">
                                Shortest path found with distance:{" "}
                                <span className="font-bold text-emerald-600">{currentStep.distances[level.end]}</span>
                            </p>
                        </div>

                        {/* Path Visualization */}
                        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <span className="text-gray-500">{Icons.route}</span>
                                Optimal Path
                            </h4>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {path.map((nodeId, idx) => {
                                    const node = level.graph.nodes.find((n) => n.id === nodeId);
                                    const edge = idx < path.length - 1
                                        ? level.graph.edges.find(
                                            (e) =>
                                                (e.from === path[idx] && e.to === path[idx + 1]) ||
                                                (e.to === path[idx] && e.from === path[idx + 1])
                                        )
                                        : null;
                                    return (
                                        <div key={nodeId} className="flex items-center gap-2">
                                            <div className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white shadow-sm">
                                                {node?.name}
                                            </div>
                                            {edge && (
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <span className="text-xs font-medium">{edge.weight}</span>
                                                    {Icons.arrowRight}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Final Graph */}
                        <div className="mb-8">
                            <GraphVisualization
                                graph={level.graph}
                                currentStep={currentStep}
                                path={path}
                                level={currentLevel}
                            />
                        </div>

                        {/* Key Learnings */}
                        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <span className="text-gray-500">{Icons.book}</span>
                                Key Takeaways
                            </h4>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 text-emerald-500">{Icons.check}</span>
                                    <span>Dijkstra always picks the unvisited node with the smallest known distance</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 text-emerald-500">{Icons.check}</span>
                                    <span>The priority queue ensures we process nodes in optimal order</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 text-emerald-500">{Icons.check}</span>
                                    <span>Once a node is visited, its shortest distance is finalized</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 text-emerald-500">{Icons.check}</span>
                                    <span>Time complexity: O((V + E) log V) with a min-heap</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={resetLevel}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                {Icons.refresh}
                                Replay Level
                            </button>
                            {currentLevel < 3 ? (
                                <button
                                    onClick={nextLevel}
                                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-gray-800"
                                >
                                    Next Level
                                    {Icons.arrowRight}
                                </button>
                            ) : (
                                <Link
                                    href="/dijkstra"
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-500"
                                >
                                    Try Interactive Visualizer
                                    {Icons.arrowRight}
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Progress Bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Learning Progress</span>
                        <span>Level {currentLevel} of 3</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full bg-gray-900 transition-all duration-500"
                            style={{
                                width: `${gameState === "complete"
                                    ? (currentLevel / 3) * 100
                                    : ((currentLevel - 1) / 3) * 100 +
                                    (gameState === "playing"
                                        ? (currentStepIndex / steps.length) * (100 / 3)
                                        : 0)
                                    }%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
