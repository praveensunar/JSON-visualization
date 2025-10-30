import React, { useState, useCallback } from "react";
import ReactFlow, { Background, MiniMap, Controls as RFControls } from "reactflow";
import "reactflow/dist/style.css";
import { useTheme } from "./ThemeContext";


const normalizePath = (raw) => {
  if (!raw) return "";
  let p = raw.trim();
  if (p.startsWith("$.") || p.startsWith("$")) {
    if (!p.startsWith("$.") && p !== "$") p = p.replace(/^\$\./, "$.");
  } else {
    if (p.startsWith(".")) p = `$${p}`;
    else p = `$${p.startsWith("[") ? "" : "."}${p}`.replace("$.", "$.");
  }
  return p;
};

/** Generate nodes & edges vertically */
const generateNodesAndEdges = (
  value,
  keyName = null,
  path = "$",
  depth = 0,
  counters = {},
  nodes = [],
  edges = [],
  parentId = null
) => {
  counters[depth] = counters[depth] ?? 0;
  const x = counters[depth] * 200; // horizontal spacing (left-right)
  const y = depth * 140; // vertical spacing (top-down)

  const nodeId = encodeURIComponent(path);
  const isArray = Array.isArray(value);
  const isObject = !isArray && value !== null && typeof value === "object";
  const isPrimitive = !isArray && !isObject;

  let labelText = "";
  if (keyName === null) {
    labelText = isPrimitive
      ? `${String(value)}`
      : isArray
      ? "Array"
      : isObject
      ? "Object"
      : String(value);
  } else {
    labelText = isPrimitive ? `${keyName}` : `${keyName}`;
  }

  const baseStyle = {
    padding: 10,
    borderRadius: 10,
    width: 140,
    textAlign: "center",
    fontWeight: 500,
    boxSizing: "border-box",
  };

  let typeStyle = {};
  if (depth === 0) {
    typeStyle = { background: "#3b82f6", color: "#fff", border: "2px solid #2563eb" }; // root
  } else if (isObject) {
    typeStyle = { background: "#99f6e4", border: "2px solid #14b8a6" }; // teal
  } else if (isArray) {
    typeStyle = { background: "#bbf7d0", border: "2px solid #22c55e" }; // green
  } else {
    typeStyle = { background: "#fde68a", border: "2px solid #f59e0b" }; // yellow
  }

  nodes.push({
    id: nodeId,
    position: { x, y },
    data: { label: labelText, path, value },
    draggable: false,
    style: { ...baseStyle, ...typeStyle },
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "straight",
      style: { strokeWidth: 2, stroke: "#94a3b8" },
      markerEnd: { type: "arrowclosed" },
    });
  }

  counters[depth] += 1;

  if (isObject) {
    for (const [k, v] of Object.entries(value)) {
      const childPath = `${path}.${k}`;
      generateNodesAndEdges(v, k, childPath, depth + 1, counters, nodes, edges, nodeId);
    }
  } else if (isArray) {
    value.forEach((item, idx) => {
      const childPath = `${path}[${idx}]`;
      generateNodesAndEdges(item, `[${idx}]`, childPath, depth + 1, counters, nodes, edges, nodeId);
    });
  }

  return { nodes, edges };
};

export default function JsonVisualization() {
  const { theme, toggleTheme } = useTheme();

  const [jsonInput, setJsonInput] = useState(`{
  "user": {
    "id": 1,
    "name": {
      "city": "New York",
      "country": "USA"
    },
    "items": [0, 1]
  }
}`);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const onInit = useCallback((instance) => setRfInstance(instance), []);

  const handleGenerate = () => {
    setMessage("");
    if (!jsonInput.trim()) {
      setMessage(" JSON input is empty.");
      setNodes([]);
      setEdges([]);
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const { nodes: n, edges: e } = generateNodesAndEdges(parsed);
      setNodes(n);
      setEdges(e);
      setTimeout(() => {
        rfInstance?.fitView({ padding: 0.2 });
      }, 150);
    } catch (err) {
      setMessage("Invalid JSON: " + err.message);
    }
  };

  const handleSearch = () => {
    const raw = searchQuery.trim();
    if (!raw) {
      setMessage("Enter a path to search.");
      return;
    }

    // Reset styles before new search
    setNodes((curr) =>
      curr.map((node) => ({
        ...node,
        style: { ...node.style, boxShadow: "none", opacity: 1 },
      }))
    );

    const normalized = normalizePath(raw);
    const match = nodes.find((n) => n.data.path === normalized);

    if (!match) {
      setMessage("No match found.");
      return;
    }

    setNodes((curr) =>
      curr.map((n) =>
        n.id === match.id
          ? {
              ...n,
              style: {
                ...n.style,
                boxShadow: "0 0 20px rgba(34,197,94,0.9)",
                border: "3px solid #16a34a",
              },
            }
          : { ...n, style: { ...n.style, opacity: 0.6 } }
      )
    );

    rfInstance?.setCenter(match.position.x, match.position.y, { zoom: 1.2 });
    setMessage("✅ Match found and highlighted.");
  };

  const resetSearch = () => {
    setSearchQuery("");
    setMessage("");
    setNodes((curr) =>
      curr.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: 1,
          boxShadow: "none",
        },
      }))
    );
  };

  return (
    <div
      className={`min-h-screen px-4 py-3 transition-all ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`grid grid-cols-2 items-center p-3 shadow rounded-t-2xl ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <h1 className="text-2xl font-bold text-center">JSON Tree Visualizer</h1>
        <div className="flex justify-end items-center gap-3">
          <span className="text-sm">Dark / Light</span>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition ${
              theme === "dark" ? "bg-gray-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform ${
                theme === "dark" ? "translate-x-7 bg-yellow-400" : "bg-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        {/* Left: JSON input */}
        <div
          className={`p-4 rounded-b-2xl ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold mb-2">JSON Input & Parsing</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className={`w-full h-[360px] p-3 border rounded resize-none ${
              theme === "dark"
                ? "bg-gray-900 text-white border-gray-700"
                : "bg-white text-black"
            }`}
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleGenerate}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Visualize
            </button>
            <button
              onClick={() => {
                setJsonInput("");
                setNodes([]);
                setEdges([]);
              }}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right: Visualization */}
        <div
          className={`p-4 rounded-b-2xl ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          <div className="flex gap-2 mb-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by path (e.g. $.user.name.city)"
              className={`flex-1 p-2 rounded outline-none border ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-black border-gray-200"
              }`}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 px-3 py-2 rounded text-white hover:bg-blue-700"
            >
              Search
            </button>
            <button
              onClick={resetSearch}
              className="bg-gray-200 px-3 py-2 rounded"
            >
              Reset
            </button>
          </div>
          <p
            className={`mt-2 text-sm ${
              message.startsWith("❌") ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>

          <div
            style={{ height: 520 }}
            className={`border rounded overflow-hidden ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onInit={onInit}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={16} size={1} />
              <RFControls />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}
