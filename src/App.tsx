import { useMemo, useState } from "react";

import "./App.css";

import { PokemonProvider, usePokemon, useDeck, toggleSelected } from "./store";

const Deck = () => {
  const [deck] = useDeck();
  return (
    <div>
      <h4>Deck</h4>
      <div>
        {deck.map((p) => (
          <div key={p.id} style={{ display: "flex" }}>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
              alt={p.name}
            />
            <div>
              <div>{p.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Search = () => {
  const [pokemon] = usePokemon();
  const [search, setSearch] = useState("");
  const filteredPokemon = useMemo(
    () =>
      pokemon.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [pokemon, search]
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        {filteredPokemon.map((p) => (
          <div key={p.name}>
            <input
              type="checkbox"
              checked={p.selected}
              onChange={() => toggleSelected(p)}
            />
            <strong>{p.name}</strong> - {p.power}
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <PokemonProvider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <Search />
        <Deck />
      </div>
    </PokemonProvider>
  );
}

export default App;
