import {
  ActionDetails,
  Action,
  Card,
  CardState,
  PlayerState,
  UserState,
  GameState,
  UserId,
  IJoinGameRequest,
  IStartGameRequest,
  IPickCardRequest,
  IApplyCardRequest,
  IEndTurnRequest,
} from "../api/types";
import { getCards } from "./cards"


export interface IPubSubFunction
{
    (...args: any[]): void;
}

function getActionInt(actions: Action[], actionName: string, eventName: string): number {  
  let filteredActions: Action[] | undefined = actions.filter((action) => action.on === actionName)
  if(actions.length === 0) return 0;

  let actionDetails: ActionDetails[] | undefined = filteredActions.reduce((details, action) => {
    details.push(...(action.events.filter((event) => event.name == eventName))) 
    return details
  }, <ActionDetails[]>[])

  return actionDetails.reduce((value, detail) => (detail?.valueInt || 0) + value, 0)
}

function playerActions(player: PlayerState, game: GameState, details: {[key: string]: any}): void {
  // check if we can skip this message
  if(details.skipPlayer === player.userId)
    return 

    for(let actionName of details.actions) {
      switch(actionName) {
      case "refreshPickable": {
        let cards: Card[] = getCards(game.maxCardLevel, 3)
        player.pickableCards = [];
        for(let card of cards) {
          player.pickableCards.push({
            card: card,
            level: 1,
            attack: player.attachBonus + getActionInt(card.actions, 'base stats', 'attack'),
            defence: player.defenceBonuse + getActionInt(card.actions, 'base stats', 'defence'),
            actions: []
          })
        }
        
        break;
      }
    }

  }
}

function gameActions(game: GameState, details: {[key: string]: any}): void {
  for(let actionName in  details.actions) {
    switch(actionName) {
      case "incRound": {
        game.round++;
        if(game.round % 3 == 0) 
          game.maxCardLevel++;
        break;
      };
      case "startCountdown": {
        // need to implement the card pick countdown
        break;
      }
    }

  }
}

export  function publish(state: GameState,  eventType: string, details: {}): void {
  // need to do this fake pub sub to get around object reloading which ditches actual pub sub...
  switch(eventType) {
    case "players": {
      for(let player of state.players) {
        playerActions(player, state, details)
      }
      break;
    }
    case "game": {
      gameActions(state, details)
      break;
    }
  }

  // if(!subscriptions[eventType])
  //     return

  // console.log('here')
  // console.log(subscriptions[eventType])
  // Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](...args))
}

