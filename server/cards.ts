import { Card } from "../api/types"
import { readdirSync, readFileSync } from "fs"
import { extname, join } from "path"

const dir = './cards';

function init(): Card[] {
  return readdirSync(dir)
           .filter((name: string) => extname(name) === '.json')
           .map((name: string) => JSON.parse(readFileSync(join(dir, name), 'utf-8')));
}

const Cards: Card[] = init();

console.log(Cards)


export function getCards(maxLevel: number, count: number): Card[] {
  let filteredCards = Cards.filter((card) => card.cardLevel <= maxLevel)
  return filteredCards.slice(0, count-1);
}