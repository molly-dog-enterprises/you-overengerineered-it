import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
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

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    return {
      deck: [],
      lives: 0,
      cash: 0,
      selectedCard: CardState.default(),
      pickableCards: [],
      opponentPickableCards: [],
      attachBonus: 0,
      defenceBonuse: 0,
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    return Response.error("Not implemented");
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    return Response.error("Not implemented");
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
    return state;
  }
}
