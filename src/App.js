import React from "react";
import Pokedex from "./components/Pokedex";

function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header with global language toggle */}
      <header
        style={{
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: "600", fontSize: "1rem" }}>Pokédex</div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Pokedex />
      </main>
    </div>
  );
}

export default App;
