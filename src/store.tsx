import { createContext } from "react";
import { BehaviorSubject, map, combineLatestWith } from "rxjs";
import { useObservableState } from "observable-hooks";

export interface Pokemon {
  id: number;
  name: string;
  type: string[];
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  power?: number;
  selected?: boolean;
}

const rawPokemon$ = new BehaviorSubject<Pokemon[]>([]);

const pokemonWithPower$ = rawPokemon$.pipe(
  map((pokemon) =>
    pokemon.map((p) => ({
      ...p,
      power:
        p.hp +
        p.attack +
        p.defense +
        p.special_attack +
        p.special_defense +
        p.speed,
    }))
  )
);

const selected$ = new BehaviorSubject<number[]>([]);

const pokemon$ = pokemonWithPower$.pipe(
  combineLatestWith(selected$),
  map(([pokemon, selected]) =>
    pokemon.map((p) => ({
      ...p,
      selected: selected.includes(p.id),
    }))
  )
);

const deck$ = pokemon$.pipe(
  map((pokemon) => pokemon.filter((p) => p.selected))
);

fetch("/pokemon-simplified.json")
  .then((res) => res.json())
  .then((data) => rawPokemon$.next(data));

const PokemonContext = createContext({
  pokemon$,
  selected$,
  deck$,
});

export const usePokemon = () => {
  return [useObservableState(pokemon$, [])];
};

export const useDeck = () => {
  return [useObservableState(deck$, [])];
};

export const toggleSelected = (p: Pokemon) => {
  if (selected$.value.includes(p.id)) {
    selected$.next(selected$.value.filter((id) => id !== p.id));
  } else {
    selected$.next([...selected$.value, p.id]);
  }
};

export const PokemonProvider: React.FunctionComponent = ({ children }) => (
  <PokemonContext.Provider
    value={{
      pokemon$,
      selected$,
      deck$,
    }}
  >
    {children}
  </PokemonContext.Provider>
);
