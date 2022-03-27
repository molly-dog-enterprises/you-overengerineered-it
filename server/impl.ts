import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import { createChannel, IPubSubFunction } from "./pubsub"
import { getCards } from "./cards"
import {
  LevelModifier,
  Action,
  Card,
  CardState,
  PlayerState,
  UserState,
  UserId,
  IJoinGameRequest,
  IStartGameRequest,
  IPickCardRequest,
  IApplyCardRequest,
  IEndTurnRequest,
} from "../api/types";

type InternalState = {
  players: PlayerState[],
  round: number,
  maxCardLevel: number,
  eventBus: { subscribe: IPubSubFunction, publish: IPubSubFunction },
  roundRemaining: number
}

function playerActions(player: PlayerState, game: InternalState): IPubSubFunction {
  return (details: {[key: string]: any}): void => {
    // check if we can skip this message
    if(details.skipPlayer === player.userId)
      return 

    for(let actionName in  details.actions) {
      switch(actionName) {
        case "refreshPickable": {
          let cards: Card[] = getCards(game.maxCardLevel, 3)
          break;
        }
      }
  
    }
  }
}

function gameActions(game: InternalState): IPubSubFunction {
  return (details: {[key: string]: any}): void => {
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
}

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    const state = {
      players: [],
      round: 0,
      maxCardLevel: 1,
      eventBus: createChannel(),
      roundRemaining: 0
    };
    state.eventBus.subscribe('game', gameActions(state));
    return state;
  }

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if(state.players.length >= 2) {
      return Response.error("Game is already full"); 
    }
    if(state.players.find((player) => player.userId === userId)) {
      return Response.error("Player is already in the game"); 
    }

    let player = PlayerState.default()
    player.userId = userId

    state.players.push(player);

    // enrol player to event bus
    state.eventBus.subscribe('player', playerActions(player, state));

    return Response.ok();  
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    if(! state.players.find((player) => player.userId === userId)) {
      return Response.error("User is is not in a game"); 
    }

    if(state.players.length != 2) {
      return Response.error("Not enough players to state game"); 
    }

    // trigger round start to player
    state.eventBus.publish('player', {skipPlayer: 'none', action: ['refreshPickable']});
    state.eventBus.publish('game', {action: ['incRound', 'startCountdown']});

    return Response.ok();  
  }
  pickCard(state: InternalState, userId: UserId, ctx: Context, request: IPickCardRequest): Response {
    return Response.error("Not implemented");
  }
  applyCard(state: InternalState, userId: UserId, ctx: Context, request: IApplyCardRequest): Response {
    return Response.error("Not implemented");
  }
  endTurn(state: InternalState, userId: UserId, ctx: Context, request: IEndTurnRequest): Response {
    return Response.error("Not implemented");
  }
  getUserState(state: InternalState, userId: UserId): UserState {
    let user = state.players.find((player) => player.userId === userId)!;
    let opponent = state.players.find((player) => player.userId !== userId)!;

    return {
      userId: user?.userId,
      lives: user?.lives,
      deck: user?.deck || [],
      cash: user?.cash,
      selectedCardPosition: user?.selectedCardPosition,
      selectedCardLocation: user?.selectedCardLocation,
      pickableCards: user?.pickableCards || [],
      opponentUserId: opponent?.userId,
      opponentlives: opponent?.lives,
      opponentPickableCards: opponent?.pickableCards || []
    }
  }
}
