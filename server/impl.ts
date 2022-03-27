import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import { publish } from "./events"
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

type InternalState = GameState;

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    const state = {
      players: [],
      round: 0,
      maxCardLevel: 1,
      // eventBus: createChannel(),
      roundRemaining: 0
    };
    // state.eventBus.subscribe('game', gameActions(state));
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
    // state.eventBus.subscribe('player', playerActions(player, state));

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
    publish(state, 'players', {skipPlayer: 'none', actions: ['refreshPickable']});
    publish(state, 'game', {actions: ['incRound', 'startCountdown']});

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
      round: state.round,
      selectedCardPosition: user?.selectedCardPosition,
      selectedCardLocation: user?.selectedCardLocation,
      pickableCards: user?.pickableCards || [],
      opponentUserId: opponent?.userId,
      opponentlives: opponent?.lives,
      opponentPickableCards: opponent?.pickableCards || []
    }
  }
}
