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
  UserId,
  IJoinGameRequest,
  IStartGameRequest,
  IPickCardRequest,
  IApplyCardRequest,
  IEndTurnRequest,
} from "../api/types";

type GameState = {
  name: string,
  players: PlayerState[],
  winner: UserId | null,
  round: number,
  maxCardLevel: number,
  eventBus: { subscribe: IPubSubFunction, publish: IPubSubFunction },
  roundRemaining: number
}
type InternalState = {
  games: GameState[],
  playerGames: Map<UserId, GameState>
  playerState: Map<UserId, PlayerState>
}

function playerActions(player: PlayerState, game: GameState): IPubSubFunction {
  return (details: {[key: string]: any}): void => {
    // check if we can skip this message
    if(details.skip === player.userId)
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

function gameActions(game: GameState): IPubSubFunction {
  return (details: {[key: string]: any}): void => {
    for(let actionName in  details.actions) {
      switch(actionName) {
        case "incRound": {
          game.round++;
          if(game.round % 3 == 0) 
            game.maxCardLevel++;
          break;
        }
      }
  
    }

  }
}

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    return {
      games: [],
      playerGames: new Map<UserId, GameState>(),
      playerState: new Map<UserId, PlayerState>(),
    };
  }



  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    // check if player is already in a game
    if(state.playerGames.get(userId)) {
      return Response.error("User is already in a Game"); 
    }

    let game;
    game = state.games.find((game) => game.name === request.name);
    if(game === undefined) {
      game = {
        name: request.name,
        players: [],
        winner: null,
        round: 0,
        roundRemaining: 0,
        maxCardLevel: 1,
        eventBus: createChannel()
      };
      state.games.push(game);

      game.eventBus.subscribe('game', gameActions(game));
    }

    if(game.players.length >= 2) {
      return Response.error("Game is already full"); 
    }

    state.playerGames.set(userId, game);

    let player = PlayerState.default()
    player.userId = userId
    player.gameName = request.name

    game.players.push(player);
    state.playerState.set(userId, player);

    // enrol player to event bus
    game.eventBus.subscribe('player', playerActions(player, game));

    return Response.ok();  
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    let game = state.playerGames.get(userId);
    if(! game) {
      return Response.error("User is is not in a game"); 
    }

    if(game.players.length != 2) {
      return Response.error("Not enough players to state game"); 
    }

    // trigger round start to player
    game.eventBus.publish('player', {skip: 'none', action: ['refreshPickable']});
    game.eventBus.publish('game', {action: ['incRound']});

    game.round = 1;
    game.roundRemaining = 600.0

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
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return state.playerState.get(userId) || PlayerState.default();
  }
}
