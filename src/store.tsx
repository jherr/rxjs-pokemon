import { createContext, useContext } from "react";
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
  const { pokemon$ } = useContext(PokemonContext);
  return [useObservableState(pokemon$, [])];
};

export const useDeck = () => {
  const { deck$ } = useContext(PokemonContext);
  return [useObservableState(deck$, [])];
};

export const useSelected = (): [number[], (value: number[]) => void] => {
  const { selected$ } = useContext(PokemonContext);
  const write = (value: number[]) => selected$.next(value);
  return [useObservableState(selected$, []), write];
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
