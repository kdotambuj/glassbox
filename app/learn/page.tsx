"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

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
    sun: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
    ),
    moon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
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

interface GraphVisualizationProps {
    graph: Graph;
    currentStep: DijkstraStep | null;
    path: string[];
    level: number;
    playerPath: string[];
    onNodeClick?: (nodeId: string) => void;
    gameStatus: string;
    startNode: string | null;
    endNode: string | null;
    isDark?: boolean;
}

// Memoized India Map Component for Performance
const IndiaMap = React.memo(({ mapPaths, stateColors, isDark }: { mapPaths: string[], stateColors: string[], isDark: boolean }) => {
    return (
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
                    stroke={isDark ? "#334155" : "#d1d5db"}
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
    );
});

IndiaMap.displayName = "IndiaMap";

// Graph Visualization Component
function GraphVisualization({
    graph,
    currentStep,
    path,
    level,
    playerPath,
    onNodeClick,
    gameStatus,
    startNode,
    endNode,
    isDark = false
}: GraphVisualizationProps) {
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [mapPaths, setMapPaths] = useState<string[]>([]);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const svgWidth = 680;
    const svgHeight = level === 3 ? 580 : 450;

    // Create D3 projection for India once
    const projection = React.useMemo(() => {
        return d3.geoMercator()
            .center([82, 22])
            .scale(850)
            .translate([svgWidth / 2, svgHeight / 2]);
    }, [svgWidth, svgHeight]);

    const getProjection = useCallback(() => projection, [projection]);

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

    // Get node coordinates - use memoized projection for Level 3
    const getNodeCoords = useCallback((nodeId: string): { x: number; y: number } => {
        if (level === 3 && indiaCityCoords[nodeId]) {
            const coords = projection([indiaCityCoords[nodeId].lng, indiaCityCoords[nodeId].lat]);
            if (coords) {
                return { x: coords[0], y: coords[1] };
            }
        }
        // Fallback to static coordinates for levels 1 & 2
        const node = graph.nodes.find(n => n.id === nodeId);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
    }, [level, graph.nodes, projection]);

    const getNodeColor = (nodeId: string) => {
        if (gameStatus === "selecting_start") {
            return nodeId === startNode ? "fill-emerald-500" : "fill-gray-100 hover:fill-emerald-100 cursor-pointer";
        }
        if (gameStatus === "selecting_end") {
            if (nodeId === startNode) return "fill-emerald-500";
            return nodeId === endNode ? "fill-rose-500" : "fill-gray-100 hover:fill-rose-100 cursor-pointer";
        }

        // Gameplay colors
        if (nodeId === startNode) return "fill-emerald-500";
        if (nodeId === endNode) return "fill-rose-500";
        if (playerPath.includes(nodeId)) return "fill-blue-500";

        const lastNode = playerPath[playerPath.length - 1];
        const isNeighbor = graph.edges.some(e =>
            (e.from === lastNode && e.to === nodeId) ||
            (e.to === lastNode && e.from === nodeId)
        );

        if (gameStatus === "playing" && isNeighbor && !playerPath.includes(nodeId)) {
            return isDark ? "fill-amber-500/30 hover:fill-amber-500/50 cursor-pointer" : "fill-amber-100 hover:fill-amber-200 cursor-pointer";
        }

        if (!currentStep) return isDark ? "fill-slate-800/50" : "fill-gray-50";
        if (nodeId === currentStep.currentNode) return "fill-amber-500";
        if (currentStep.visited.includes(nodeId)) return "fill-emerald-500";
        if (currentStep.priorityQueue.some((p) => p.node === nodeId)) return "fill-blue-500";
        return "fill-gray-50";
    };

    const getNodeStroke = (nodeId: string) => {
        if (nodeId === startNode) return "stroke-emerald-600";
        if (nodeId === endNode) return "stroke-rose-600";
        if (playerPath.includes(nodeId)) return "stroke-blue-600";

        if (!currentStep) return "stroke-gray-300";
        if (nodeId === currentStep.currentNode) return "stroke-amber-600";
        if (currentStep.visited.includes(nodeId)) return "stroke-emerald-600";
        if (currentStep.priorityQueue.some((p) => p.node === nodeId)) return "stroke-blue-600";
        return "stroke-gray-300";
    };

    const getEdgeColor = (from: string, to: string) => {
        // Player path edges
        for (let i = 0; i < playerPath.length - 1; i++) {
            if ((playerPath[i] === from && playerPath[i + 1] === to) ||
                (playerPath[i] === to && playerPath[i + 1] === from)) {
                return "stroke-blue-500";
            }
        }

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
        if (!currentStep) return isDark ? "stroke-slate-800" : "stroke-gray-200";
        if (currentStep.visited.includes(from) && currentStep.visited.includes(to)) {
            return isDark ? "stroke-slate-600" : "stroke-gray-400";
        }
        return isDark ? "stroke-slate-800" : "stroke-gray-300";
    };

    const getEdgeWidth = (from: string, to: string) => {
        // Player path width
        for (let i = 0; i < playerPath.length - 1; i++) {
            if ((playerPath[i] === from && playerPath[i + 1] === to) ||
                (playerPath[i] === to && playerPath[i + 1] === from)) {
                return 3;
            }
        }

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
        return 1.5;
    };

    // Muted state colors - subtle and professional
    const stateColors = isDark
        ? ['#0f172a', '#1e293b', '#334155', '#475569', '#1e1b4b', '#312e81']
        : [
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
        <div className={`relative w-full h-full overflow-hidden rounded-xl border transition-colors duration-500 ${isDark ? 'bg-slate-900 border-slate-700 shadow-2xl' : 'bg-white border-gray-200 shadow-sm'} min-h-[400px]`}>
            {/* Zoom Controls for Level 3 */}
            {level === 3 && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button
                        onClick={() => setZoom(prev => Math.min(prev + 0.5, 4))}
                        className={`p-2 rounded-lg shadow-lg border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <button
                        onClick={() => {
                            setZoom(1);
                            setOffset({ x: 0, y: 0 });
                        }}
                        className={`p-2 rounded-lg shadow-lg border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" /></svg>
                    </button>
                    <button
                        onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
                        className={`p-2 rounded-lg shadow-lg border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                </div>
            )}

            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className={`w-full h-full ${level === 3 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                preserveAspectRatio="xMidYMid meet"
                onMouseDown={(e) => {
                    if (level !== 3) return;
                    isDragging.current = true;
                    lastPos.current = { x: e.clientX, y: e.clientY };
                }}
                onMouseMove={(e) => {
                    if (!isDragging.current || level !== 3) return;
                    const dx = (e.clientX - lastPos.current.x) / zoom;
                    const dy = (e.clientY - lastPos.current.y) / zoom;
                    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                    lastPos.current = { x: e.clientX, y: e.clientY };
                }}
                onMouseUp={() => isDragging.current = false}
                onMouseLeave={() => isDragging.current = false}
            >
                <g transform={`scale(${zoom}) translate(${offset.x}, ${offset.y})`} style={{ transformOrigin: 'center' }}>
                    {/* Grid Background */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? "#1e293b" : "#f3f4f6"} strokeWidth="1" />
                        </pattern>
                        {/* Gradient for India map */}
                        <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isDark ? "#1e293b" : "#f0fdf4"} />
                            <stop offset="100%" stopColor={isDark ? "#0f172a" : "#dcfce7"} />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" x={-svgWidth * 2} y={-svgHeight * 2} width={svgWidth * 5} height={svgHeight * 5} />

                    {/* Loading state for Level 3 */}
                    {level === 3 && isMapLoading && (
                        <g>
                            <rect x={svgWidth / 2 - 100} y={svgHeight / 2 - 30} width={200} height={60} rx={8} fill={isDark ? "#1e293b" : "#f9fafb"} stroke={isDark ? "#334155" : "#e5e7eb"} strokeWidth={1} />
                            <text x={svgWidth / 2} y={svgHeight / 2 + 5} textAnchor="middle" className={`${isDark ? 'fill-slate-400' : 'fill-gray-500'} text-sm font-medium`}>
                                Map is loading...
                            </text>
                        </g>
                    )}

                    {/* India Map for Level 3 - D3 GeoJSON rendering */}
                    {level === 3 && !isMapLoading && (
                        <IndiaMap mapPaths={mapPaths} stateColors={stateColors} isDark={isDark} />
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
                                    className={`${isDark ? 'fill-slate-800 stroke-slate-700' : 'fill-white stroke-gray-200'}`}
                                    strokeWidth={1}
                                />
                                <text
                                    x={midX}
                                    y={midY + 5}
                                    textAnchor="middle"
                                    className={`${isDark ? 'fill-slate-300' : 'fill-gray-600'} text-xs font-medium`}
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
                                    className={`${isDark ? 'fill-black' : 'fill-gray-300'} opacity-30`}
                                />
                                {/* Node circle */}
                                <circle
                                    cx={coords.x}
                                    cy={coords.y}
                                    r={nodeRadius}
                                    className={`${getNodeColor(node.id)} ${getNodeStroke(node.id)} transition-all duration-300`}
                                    strokeWidth={node.id === startNode || node.id === endNode ? 3 : 2}
                                    onClick={() => onNodeClick?.(node.id)}
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
                                        className={`${isDark ? 'fill-slate-300' : 'fill-gray-700'} text-xs font-semibold`}
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
                                            fill={isDark ? "#1e293b" : "white"}
                                            stroke={isDark ? "#334155" : "#e5e7eb"}
                                            strokeWidth={1}
                                            opacity={0.95}
                                        />
                                        <text
                                            x={labelPos.anchor === 'end' ? coords.x + labelPos.labelX - 5 : coords.x + labelPos.labelX + 5}
                                            y={coords.y + labelPos.labelY + 3}
                                            textAnchor={labelPos.anchor}
                                            className={isDark ? "fill-slate-200 font-semibold" : "fill-gray-700 font-semibold"}
                                            style={{ fontSize: '9px' }}
                                        >
                                            {node.name}
                                        </text>
                                        {/* Start/End badge */}
                                        {(node.id === startNode || node.id === endNode) && (
                                            <text
                                                x={labelPos.anchor === 'end' ? coords.x + labelPos.labelX - 55 : coords.x + labelPos.labelX + 55}
                                                y={coords.y + labelPos.labelY + 3}
                                                textAnchor={labelPos.anchor === 'end' ? 'start' : 'end'}
                                                className={node.id === startNode ? 'fill-emerald-600' : 'fill-rose-600'}
                                                style={{ fontSize: '7px', fontWeight: 'bold' }}
                                            >
                                                {node.id === startNode ? '●' : '◆'}
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
                                {/* Start indicator */}
                                {node.id === startNode && (
                                    <g>
                                        <rect
                                            x={coords.x - 18}
                                            y={coords.y + nodeRadius + 3}
                                            width={36}
                                            height={14}
                                            rx={3}
                                            className="fill-emerald-500 stroke-emerald-600"
                                            strokeWidth={1}
                                        />
                                        <text
                                            x={coords.x}
                                            y={coords.y + nodeRadius + 13}
                                            textAnchor="middle"
                                            className="fill-white text-[9px] font-bold"
                                        >
                                            START
                                        </text>
                                    </g>
                                )}
                                {/* End indicator */}
                                {node.id === endNode && (
                                    <g>
                                        <rect
                                            x={coords.x - 14}
                                            y={coords.y + nodeRadius + 3}
                                            width={28}
                                            height={14}
                                            rx={3}
                                            className="fill-rose-500 stroke-rose-600"
                                            strokeWidth={1}
                                        />
                                        <text
                                            x={coords.x}
                                            y={coords.y + nodeRadius + 13}
                                            textAnchor="middle"
                                            className="fill-white text-[9px] font-bold"
                                        >
                                            END
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </g>
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

// Interactive Intro Graph Component
interface IntroGraphProps {
    level: number;
    isDark: boolean;
}

function InteractiveIntroGraph({ level, isDark }: IntroGraphProps) {
    // Level-specific graph configurations
    const configs = [
        {
            nodes: [
                { id: 1, x: 50, y: 100 }, { id: 2, x: 150, y: 50 },
                { id: 3, x: 150, y: 150 }, { id: 4, x: 250, y: 100 },
                { id: 5, x: 350, y: 100 }
            ],
            edges: [
                { from: 1, to: 2, weight: 4 }, { from: 1, to: 3, weight: 2 },
                { from: 2, to: 4, weight: 3 }, { from: 3, to: 4, weight: 5 },
                { from: 4, to: 5, weight: 1 }
            ],
            shortestPath: [1, 2, 4, 5]
        },
        {
            nodes: [
                { id: 1, x: 50, y: 50 }, { id: 2, x: 150, y: 30 },
                { id: 3, x: 50, y: 150 }, { id: 4, x: 150, y: 100 },
                { id: 5, x: 250, y: 50 }, { id: 6, x: 250, y: 150 },
                { id: 7, x: 350, y: 100 }
            ],
            edges: [
                { from: 1, to: 2, weight: 2 }, { from: 1, to: 3, weight: 8 },
                { from: 2, to: 4, weight: 5 }, { from: 2, to: 5, weight: 3 },
                { from: 3, to: 4, weight: 1 }, { from: 4, to: 6, weight: 6 },
                { from: 5, to: 7, weight: 4 }, { from: 6, to: 7, weight: 2 }
            ],
            shortestPath: [1, 2, 5, 7]
        },
        {
            nodes: [
                { id: 1, x: 50, y: 100 }, { id: 2, x: 120, y: 40 },
                { id: 3, x: 120, y: 160 }, { id: 4, x: 200, y: 100 },
                { id: 5, x: 280, y: 40 }, { id: 6, x: 280, y: 160 },
                { id: 7, x: 350, y: 100 }, { id: 8, x: 200, y: 30 },
                { id: 9, x: 200, y: 170 }
            ],
            edges: [
                { from: 1, to: 2, weight: 10 }, { from: 1, to: 3, weight: 15 },
                { from: 2, to: 4, weight: 5 }, { from: 2, to: 8, weight: 2 },
                { from: 3, to: 4, weight: 8 }, { from: 3, to: 9, weight: 4 },
                { from: 8, to: 5, weight: 3 }, { from: 9, to: 6, weight: 7 },
                { from: 4, to: 5, weight: 12 }, { from: 4, to: 6, weight: 11 },
                { from: 5, to: 7, weight: 6 }, { from: 6, to: 7, weight: 9 }
            ],
            shortestPath: [1, 2, 8, 5, 7]
        }
    ];

    const { nodes, edges, shortestPath } = configs[level - 1];

    const colors = {
        line: isDark ? "#334155" : "#e2e8f0",
        node: isDark ? "#1e293b" : "#ffffff",
        stroke: isDark ? "#475569" : "#cbd5e1",
        text: isDark ? "#94a3b8" : "#64748b",
        highlight: "#10b981", // Emerald Neon
        path: "#3b82f6"      // Blue Neon
    };

    return (
        <div className="w-full max-w-lg mx-auto py-2">
            <svg viewBox="0 0 400 200" className="w-full h-auto overflow-visible drop-shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.g key={level}>
                        {/* Edges */}
                        {edges.map((edge, i) => {
                            const from = nodes.find(n => n.id === edge.from)!;
                            const to = nodes.find(n => n.id === edge.to)!;
                            return (
                                <g key={`edge-${level}-${i}`}>
                                    <motion.line
                                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                        stroke={colors.line} strokeWidth="1.5"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: i * 0.03 }}
                                    />
                                    <motion.text
                                        x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}
                                        textAnchor="middle" className="font-black italic bg-slate-900"
                                        style={{ fontSize: '12px', fill: colors.text }}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + i * 0.03 }}
                                    >
                                        {edge.weight}
                                    </motion.text>
                                </g>
                            );
                        })}

                        {/* Shortest Path Highlight */}
                        {shortestPath.slice(0, -1).map((nodeId, i) => {
                            const from = nodes.find(n => n.id === nodeId)!;
                            const to = nodes.find(n => n.id === shortestPath[i + 1])!;
                            return (
                                <motion.line
                                    key={`path-${level}-${i}`}
                                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                    stroke={colors.path} strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.6, delay: 1.2 + i * 0.15 }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node) => (
                            <motion.g
                                key={`node-${level}-${node.id}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 * node.id }}
                            >
                                <circle
                                    cx={node.x} cy={node.y} r="10"
                                    fill={colors.node} stroke={colors.stroke}
                                    strokeWidth="2"
                                />
                                <motion.circle
                                    cx={node.x} cy={node.y} r="6"
                                    fill={shortestPath.includes(node.id) ? colors.path : colors.highlight}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: shortestPath.includes(node.id) ? 1 : 0.6 }}
                                    transition={{ delay: shortestPath.includes(node.id) ? 1.2 + (shortestPath.indexOf(node.id) * 0.15) : 0.5 }}
                                />
                                {shortestPath.includes(node.id) && (
                                    <motion.circle
                                        cx={node.x} cy={node.y} r="14"
                                        fill="none" stroke={colors.path} strokeWidth="1"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: [0, 0.4, 0], scale: [1, 2] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.g>
                        ))}
                    </motion.g>
                </AnimatePresence>
            </svg>
        </div>
    );
}

// Main Component
export default function LearnPage() {
    const [currentLevel, setCurrentLevel] = useState(1);
    const [gameState, setGameState] = useState<"intro" | "selecting_start" | "selecting_end" | "playing" | "complete">("intro");
    const [steps, setSteps] = useState<DijkstraStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("game-theme") as "light" | "dark";
        if (savedTheme) setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("game-theme", newTheme);
    };

    // Game specific state
    const [startNode, setStartNode] = useState<string | null>(null);
    const [endNode, setEndNode] = useState<string | null>(null);
    const [playerPath, setPlayerPath] = useState<string[]>([]);
    const [playerDist, setPlayerDist] = useState(0);
    const [instruction, setInstruction] = useState("");

    const level = levels[currentLevel - 1];
    const currentStep = steps[currentStepIndex] || null;
    const path = currentStep ? getPath(currentStep.previous, endNode || "") : [];
    const isLastStep = currentStepIndex === steps.length - 1;

    const startSetup = useCallback(() => {
        setGameState("selecting_start");
        setInstruction("Choose your starting node");
        setStartNode(null);
        setEndNode(null);
        setPlayerPath([]);
        setPlayerDist(0);
    }, []);

    const handleNodeClick = useCallback((nodeId: string) => {
        if (gameState === "selecting_start") {
            setStartNode(nodeId);
            setGameState("selecting_end");
            setInstruction("Now, choose your destination node");
        } else if (gameState === "selecting_end") {
            if (nodeId === startNode) return;
            setEndNode(nodeId);
            setGameState("playing");
            setPlayerPath([startNode!]);
            setInstruction("Navigate to the destination! Tap a connected node to move.");

            // Calculate optimal path for later comparison
            const dijkstraSteps = runDijkstra(level.graph, startNode!, nodeId);
            setSteps(dijkstraSteps);
            setCurrentStepIndex(dijkstraSteps.length - 1);
        } else if (gameState === "playing") {
            const lastNode = playerPath[playerPath.length - 1];
            if (nodeId === lastNode) return;
            if (playerPath.includes(nodeId)) return; // Prevent cycles for simplicity in this game

            const edge = level.graph.edges.find(e =>
                (e.from === lastNode && e.to === nodeId) ||
                (e.to === lastNode && e.from === nodeId)
            );

            if (edge) {
                const newPath = [...playerPath, nodeId];
                setPlayerPath(newPath);
                setPlayerDist(prev => prev + edge.weight);

                if (nodeId === endNode) {
                    setGameState("complete");
                } else {
                    const neighbors = level.graph.edges.filter(e => e.from === nodeId || e.to === nodeId);
                    setInstruction(`Moved to ${level.graph.nodes.find(n => n.id === nodeId)?.name}. Choose the next node.`);
                }
            }
        }
    }, [gameState, startNode, endNode, playerPath, level]);

    const resetLevel = useCallback(() => {
        setGameState("selecting_start");
        setInstruction("Choose your starting node");
        setStartNode(null);
        setEndNode(null);
        setPlayerPath([]);
        setPlayerDist(0);
    }, []);

    const nextLevel = useCallback(() => {
        if (currentLevel < 3) {
            setCurrentLevel((prev) => prev + 1);
            setGameState("intro");
            setSteps([]);
            setStartNode(null);
            setEndNode(null);
            setPlayerPath([]);
            setPlayerDist(0);
        }
    }, [currentLevel]);

    const isDark = theme === "dark";

    return (
        <div className={`h-screen flex flex-col overflow-hidden font-sans transition-colors duration-500 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
            {/* Header - Hidden during Intro */}
            {gameState !== "intro" && (
                <header className={`border-b border-gray-200 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                        >
                            {Icons.arrowLeft}
                            <span className="font-medium">Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-slate-900'}`}>
                                {level.title.split(': ')[1]}
                            </h1>
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
            )}

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-4 overflow-hidden flex flex-col">
                {/* Intro State */}
                {gameState === "intro" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 transition-colors duration-700 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}
                    >
                        {/* 1. Minimal Top Bar */}
                        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                            <Link
                                href="/"
                                className={`flex items-center gap-1.5 text-xs font-black tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <span className="text-sm">←</span> BACK
                            </Link>

                            <button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-xl transition-all duration-300 ${isDark ? 'bg-slate-800 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}
                            >
                                {isDark ? Icons.sun : Icons.moon}
                            </button>
                        </div>

                        {/* 2. Hero Title Section */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-10 text-center"
                        >
                            <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter px-4 py-2 overflow-visible ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500' : 'text-slate-900'}`}>
                                Pathfinding Odyssey
                            </h2>
                            <div className={`h-1.5 w-24 mx-auto mt-4 rounded-full ${isDark ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-900'}`}></div>
                        </motion.div>

                        {/* 3. Central Graphic */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="w-full"
                        >
                            <InteractiveIntroGraph level={currentLevel} isDark={isDark} />
                        </motion.div>

                        {/* 4. Micro Hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                            className={`mt-4 text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-emerald-500/80 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-slate-600'}`}
                        >
                            Algorithm: Dijkstra’s Global Optimal
                        </motion.p>

                        {/* 5. Primary CTA Button */}
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, type: "spring" }}
                            onClick={startSetup}
                            className={`mt-14 px-16 py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${isDark
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]'
                                : 'bg-slate-900 text-white shadow-xl hover:bg-slate-800'
                                }`}
                        >
                            Begin Journey
                        </motion.button>

                        {/* 6. Progress Indicator (Bottom) */}
                        <div className="absolute bottom-12 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4">
                                {[
                                    { id: 1, name: "Level 1" },
                                    { id: 2, name: "Level 2" },
                                    { id: 3, name: "Level 3" }
                                ].map((l, idx) => (
                                    <div key={l.id} className="flex flex-col items-center group">
                                        <div className="flex items-center">
                                            <motion.div
                                                animate={{
                                                    scale: l.id === currentLevel ? 1.4 : 1,
                                                    backgroundColor: l.id === currentLevel ? (isDark ? '#10b981' : '#0f172a') : (isDark ? '#1e293b' : '#cbd5e1')
                                                }}
                                                className={`w-3 h-3 rounded-full relative z-10 transition-all duration-500 ${l.id === currentLevel ? 'shadow-[0_0_15px_#10b981]' : ''}`}
                                            />
                                            {idx < 2 && (
                                                <div className={`w-20 h-[2px] mx-1 rounded-full transition-all duration-1000 ${l.id < currentLevel ? (isDark ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-900') : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`} />
                                            )}
                                        </div>
                                        <span className={`mt-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${l.id === currentLevel ? (isDark ? 'text-emerald-400 scale-110 opacity-100' : 'text-slate-900 opacity-100') : 'text-slate-500 opacity-40'}`}>
                                            {l.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Playing State */}
                {(gameState === "playing" || gameState === "selecting_start" || gameState === "selecting_end") && (
                    <div className="flex-1 min-h-0 grid gap-6 lg:grid-cols-3">
                        {/* Graph Visualization */}
                        <div className="lg:col-span-2 relative flex flex-col min-h-0">
                            {/* Pro Tip - Relocated to top of graph */}
                            <div className={`mb-4 p-4 rounded-xl border transition-all duration-500 ${isDark ? 'bg-slate-900/40 border-slate-800 shadow-inner' : 'bg-amber-50 border-amber-100 shadow-sm'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                                        {Icons.lightbulb}
                                    </div>
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-amber-500/60' : 'text-amber-600'}`}>Strategic Insight</h4>
                                        <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-amber-900'}`}>
                                            {level.hint}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 relative">
                                <GraphVisualization
                                    graph={level.graph}
                                    currentStep={null}
                                    path={[]}
                                    level={currentLevel}
                                    playerPath={playerPath}
                                    onNodeClick={handleNodeClick}
                                    gameStatus={gameState}
                                    startNode={startNode}
                                    endNode={endNode}
                                    isDark={isDark}
                                />
                            </div>

                            <div className={`mt-4 flex flex-wrap items-center gap-6 text-sm bg-opacity-50 transition-colors ${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-white text-gray-600'} p-3 rounded-xl border ${isDark ? 'border-slate-800' : 'border-gray-100'} shadow-sm`}>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                    <span className="font-bold text-[10px] uppercase">Start</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
                                    <span className="font-bold text-[10px] uppercase">End</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                                    <span className="font-bold text-[10px] uppercase">Path</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-4 w-4 rounded-full border ${isDark ? 'bg-amber-500/20 border-amber-500/50' : 'bg-amber-100 border-amber-300'}`}></div>
                                    <span className="font-bold text-[10px] uppercase">Valid Moves</span>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel */}
                        <div className="overflow-y-auto space-y-6 pt-4 pr-2 custom-scrollbar">
                            {/* Instruction Component - Enhanced Floating and Visibility */}
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                    boxShadow: isDark
                                        ? ["0 4px 20px rgba(16,185,129,0.1)", "0 10px 40px rgba(16,185,129,0.3)", "0 4px 20px rgba(16,185,129,0.1)"]
                                        : ["0 4px 20px rgba(79,70,229,0.1)", "0 10px 40px rgba(79,70,229,0.3)", "0 4px 20px rgba(79,70,229,0.1)"]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className={`mt-6 p-6 rounded-2xl border-2 relative overflow-hidden transition-all duration-500 ${isDark ? 'bg-slate-900 border-emerald-500/50 text-white shadow-emerald-500/20' : 'bg-gradient-to-br from-indigo-600 to-purple-800 text-white border-white/20'}`}
                            >
                                <div className={`absolute -right-4 -top-4 h-28 w-28 rounded-full blur-3xl transition-colors ${isDark ? 'bg-emerald-400/20' : 'bg-white/20'}`}></div>
                                <div className="flex items-center gap-4 mb-3 relative z-10">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-white text-indigo-600 shadow-lg'}`}
                                    >
                                        {Icons.rocket}
                                    </motion.div>
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-emerald-400' : 'text-indigo-100'}`}>Next Objective</span>
                                        <h4 className="text-xs font-bold opacity-80 uppercase tracking-widest text-white/60">Active Intel</h4>
                                    </div>
                                </div>
                                <p className={`text-base font-black leading-snug relative z-10 ${isDark ? 'text-slate-50' : 'text-white'}`}>
                                    {instruction}
                                </p>
                                <div className={`mt-3 h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white/10'}`}>
                                    <motion.div
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                        className={`h-full w-1/3 ${isDark ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-white'}`}
                                    />
                                </div>
                            </motion.div>

                            {/* Game Stats - Moved from main area */}
                            <div className={`p-5 rounded-2xl border transition-colors duration-500 ${isDark ? 'bg-slate-900 border-slate-700 shadow-2xl' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Total Distance</span>
                                            <span className={`text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-gray-900'}`}>{playerDist}</span>
                                        </div>
                                        <button
                                            onClick={resetLevel}
                                            className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            title="Reset Level"
                                        >
                                            {Icons.refresh}
                                        </button>
                                    </div>
                                    <div className={`h-px w-full ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Current Location</span>
                                        <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                                            {playerPath.length > 0
                                                ? level.graph.nodes.find(n => n.id === playerPath[playerPath.length - 1])?.name
                                                : "Initial Selection"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border transition-colors duration-500 ${isDark ? 'bg-slate-900 border-slate-700 shadow-2xl text-slate-100' : 'bg-white border-gray-200 shadow-sm text-gray-900'}`}>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                                    {Icons.route}
                                    Mission Path
                                </h3>
                                <div className="space-y-3">
                                    {playerPath.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">No nodes selected yet...</p>
                                    ) : (
                                        playerPath.map((nodeId, idx) => {
                                            const node = level.graph.nodes.find(n => n.id === nodeId);
                                            return (
                                                <div key={nodeId} className="flex items-center gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">{node?.name}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                )}

                {/* Complete State */}
                {gameState === "complete" && currentStep && (
                    <div className="flex-1 overflow-y-auto pr-2 animate-in fade-in zoom-in duration-500 flex flex-col gap-6 pb-28">
                        {(() => {
                            const optimalDist = currentStep.distances[endNode!];
                            const won = playerDist === optimalDist;

                            const colorClass = won ? "emerald" : "rose";
                            const badgeText = won ? "MISSION SUCCESS" : "MISSION FAILED";
                            const desc = won
                                ? "You found the globally optimal path. Strategic efficiency achieved."
                                : "You arrived, but your path was suboptimal. Efficiency targets were not met.";

                            const BgColors = isDark ? {
                                emerald: "bg-emerald-500/10 border-emerald-500/30",
                                rose: "bg-rose-500/10 border-rose-500/30"
                            } : {
                                emerald: "bg-emerald-50 border-emerald-200",
                                rose: "bg-rose-50 border-rose-200"
                            };

                            const TextColors = isDark ? {
                                emerald: "text-emerald-400",
                                rose: "text-rose-400"
                            } : {
                                emerald: "text-emerald-800",
                                rose: "text-rose-800"
                            };

                            const BadgeColors = {
                                emerald: "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
                                rose: "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                            };

                            return (
                                <div className={`rounded-3xl border ${BgColors[colorClass as keyof typeof BgColors]} p-8 text-center shadow-2xl backdrop-blur-md`}>
                                    <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl ${BadgeColors[colorClass as keyof typeof BadgeColors]} text-white transform rotate-3`}>
                                        {won ? Icons.trophy : Icons.eyeOff}
                                    </div>
                                    <h3 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{badgeText}</h3>
                                    <p className={`text-xl ${TextColors[colorClass as keyof typeof TextColors]} font-bold mb-8 uppercase tracking-widest`}>
                                        {desc}
                                    </p>

                                    {!won && (
                                        <div className={`mb-8 p-6 rounded-2xl text-left max-w-2xl mx-auto border transition-colors ${isDark ? 'bg-slate-900/80 border-rose-500/20 shadow-inner text-slate-300' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                                            <h4 className={`text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                                                {Icons.lightbulb} Algorithm Principles Violated
                                            </h4>
                                            <p className="text-sm leading-relaxed mb-4">
                                                Dijkstra's algorithm relies on the <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>Greedy Choice Property</strong>: at every step, we MUST choose the unvisited node with the absolute smallest current distance.
                                            </p>
                                            <p className="text-sm leading-relaxed">
                                                By skipping a shorter connection, you lost the <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>Global Optimality</strong>. The algorithm ensures the shortest path precisely because it never relaxes a node unless it's the closest reachable one.
                                            </p>
                                        </div>
                                    )}

                                    <div className={`flex justify-center gap-12 max-w-sm mx-auto p-6 rounded-2xl border backdrop-blur-sm shadow-inner transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white/50 border-white'}`}>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>YOUR COST</span>
                                            <span className={`text-4xl font-black ${won ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-rose-400' : 'text-rose-600')}`}>{playerDist}</span>
                                        </div>
                                        <div className={`w-px ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>OPTIMAL</span>
                                            <span className={`text-4xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {optimalDist}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Your Path */}
                            <div className={`rounded-2xl border transition-colors p-6 flex flex-col ${isDark ? 'bg-slate-900/50 border-blue-500/20 text-slate-100 shadow-2xl' : 'border-blue-100 bg-blue-50/50 text-gray-900'}`}>
                                <h4 className={`flex items-center gap-2 font-black mb-4 text-sm tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>
                                    {Icons.route} YOUR PATH
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {playerPath.map((id, idx) => (
                                        <div key={id} className="flex items-center gap-2">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black shadow-lg ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                {level.graph.nodes.find(n => n.id === id)?.name}
                                            </span>
                                            {idx < playerPath.length - 1 && <span className={`${isDark ? 'text-blue-500/50' : 'text-blue-300'}`}>{Icons.arrowRight}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Optimal Path */}
                            <div className={`rounded-2xl border transition-colors p-6 flex flex-col ${isDark ? 'bg-slate-900/50 border-emerald-500/20 text-slate-100 shadow-2xl' : 'border-emerald-100 bg-emerald-50/50 text-gray-900'}`}>
                                <h4 className={`flex items-center gap-2 font-black mb-4 text-sm tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-900'}`}>
                                    {Icons.check} OPTIMAL PATH
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {path.map((id, idx) => (
                                        <div key={id} className="flex items-center gap-2">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black shadow-lg ${isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                                {level.graph.nodes.find(n => n.id === id)?.name}
                                            </span>
                                            {idx < path.length - 1 && <span className={`${isDark ? 'text-emerald-500/30' : 'text-emerald-500/50'} italic text-[10px]`}>next</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recap Graph */}
                        <div className={`overflow-hidden rounded-2xl border transition-colors shadow-2xl min-h-[500px] ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <GraphVisualization
                                graph={level.graph}
                                currentStep={null}
                                path={path}
                                level={currentLevel}
                                playerPath={playerPath}
                                gameStatus="complete"
                                startNode={startNode}
                                endNode={endNode}
                                isDark={isDark}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-6 py-12">
                            <button
                                onClick={resetLevel}
                                className={`flex items-center gap-2 rounded-2xl px-10 py-5 font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {Icons.refresh}
                                Retry Mission
                            </button>
                            {currentLevel < 3 ? (
                                <button
                                    onClick={nextLevel}
                                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 font-black text-white shadow-xl transition-all hover:bg-gray-800 hover:translate-y-[-2px] active:scale-95"
                                >
                                    Next Level
                                    {Icons.arrowRight}
                                </button>
                            ) : (
                                <Link
                                    href="/dijkstra"
                                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-black text-white shadow-xl transition-all hover:bg-blue-500 hover:translate-y-[-2px] active:scale-95"
                                >
                                    Try Deep Sea Visualizer
                                    {Icons.arrowRight}
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Progress Bar - Removed as requested */}
            {/* <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white"> ... </div> */}
        </div>
    );
}
