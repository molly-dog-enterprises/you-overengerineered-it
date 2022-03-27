import { Card } from "../api/types"
const Cards: Card[] = [

]

export function getCards(maxLevel: number, count: number): Card[] {
  let filteredCards = Cards.filter((card) => card.cardLevel <= maxLevel)
  return filteredCards.slice(0, count-1);

}