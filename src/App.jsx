import React, { useState } from "react";

export default function App() {
  const [items] = useState(["Sample 1", "Sample 2", "Sample 3"]);
  const [winner, setWinner] = useState("");

  function spin() {
    const index = Math.floor(Math.random() * items.length);
    setWinner(items[index]);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900 text-white">
      <h1 className="text-3xl font-bold mb-6">
        4th SIWRSOA General Assembly Grand Raffle
      </h1>

      <button
        onClick={spin}
        className="bg-white text-black px-6 py-3 rounded-xl font-bold"
      >
        Spin
      </button>

      <div className="mt-6 text-2xl">
        Winner: {winner || "-"}
      </div>
    </div>
  );
}
