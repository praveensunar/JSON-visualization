// import React, { useState, useEffect } from "react";
// import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
// import "reactflow/dist/style.css";

// export default function App() {
//   const [darkMode, setDarkMode] = useState(false);

//   // Apply dark mode class to <html>
//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 transition-all">
//       {/* Header with Toggle */}
//       <div className="grid grid-cols-2 items-center p-3 bg-white dark:bg-gray-800 shadow rounded">
//         <h1 className="text-3xl font-bold text-center">JSON Tree Visualizer</h1>

//         {/* Switch button */}
//         <div className="flex justify-end">
//           <h3 className="font-thin pr-2 text-sl">Dark / Light</h3>
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className="relative w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-full transition duration-300"
//           >
//             <div
//               className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-yellow-400 rounded-full transition-transform duration-300  ${
//                 darkMode ? "translate-x-8" : ""
//               }`}
//             ></div>
//           </button>
//         </div>
//       </div>

//       {/* Two Equal Halves */}
//       <div className="grid grid-cols-1 md:grid-cols-2 mx-auto mt-6 gap-4">
//         {/* Left Half - Input Section */}
//         <div className="p-4 rounded bg-white dark:bg-gray-800 shadow">
//           <h2 className="text-lg font-semibold mb-3">Enter JSON Data</h2>
//           <textarea
//             className="w-full h-[380px] p-2 border rounded text-black"
//             placeholder="Paste your JSON here..."
//           ></textarea>

//           <div className="flex justify-center mt-4">
//             <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
//               Generate Tree
//             </button>
//           </div>
//         </div>

//         {/* Right Half - Visualization Section */}
//         <div className="p-4 bg-white dark:bg-gray-800 shadow">
//           <div className="flex rounded-xl border mb-3 overflow-hidden">
//             <input
//               placeholder="$.user.address.city"
//               className="flex-1 p-2 text-black  outline-none"
//             />
//             <button className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
//               Search
//             </button>
//           </div>

//           <p className="text-sm mb-2 text-yellow-600 dark:text-yellow-400">
//             Message or error will appear here
//           </p>

//           <div className="h-[400px] border rounded overflow-hidden">
//             <ReactFlow fitView proOptions={{ hideAttribution: true }}>
//               <Background />
//               <Controls />
//               <MiniMap />
//             </ReactFlow>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React from 'react'
import { ThemeProvider } from './components/ThemeContext'
import Jsonvisualiztion from './components/Jsonvisualiztion'

function App() {
  return (
    <ThemeProvider>
      <Jsonvisualiztion/>
    </ThemeProvider>
    
  )
}

export default App