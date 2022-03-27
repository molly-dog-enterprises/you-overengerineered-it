import { Card } from "../api/types"
import { readdirSync, readFileSync } from "fs"
import { extname, join, dirname } from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dir = join(__dirname, './cards');

function init(): Card[] {
  return readdirSync(dir)
           .filter((name: string) => extname(name) === '.json')
           .map((name: string) => JSON.parse(readFileSync(join(dir, name), 'utf-8')));
}

const Cards: Card[] = init();

// console.log(Cards)

export function getCards(maxLevel: number, count: number): Card[] {
  let filteredCards = Cards.filter((card) => card.cardLevel <= maxLevel)
  
  let cards: Card[] = [];
  for(let i = 0; i < count; i++) {
    cards.push(filteredCards[0]);
  }

  return cards;
} 