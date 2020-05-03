import { Response_get_characters_character_id_200 } from "../../esi/esi";
import { EsiResponse } from "../types";
import { ActionType } from "redux-promise-middleware";
import { EsiError } from "../../esi/client";

export interface CharacterState {
  characters: CharacterInfo[];
  error: EsiError | null;
}

export interface CharacterInfo {
  id: number;
  public?: PublicCharacterInfo;
  auth?: CharacterEsiAuth;
  apiState: ApiState;
}

export enum ApiConnectionStatus {
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
}

export interface ApiState {
  status: ApiConnectionStatus;
}

export interface PublicCharacterInfo {
  name: string;
  alliance_id?: number;
  corporation_id: number;
  security_status?: number;
}

export const UPDATE_CHARACTER_PUBLIC_INFO = "UPDATE_CHARACTER_PUBLIC_INFO";
export const UPDATE_CHARACTER_PUBLIC_INFO_PENDING =
  UPDATE_CHARACTER_PUBLIC_INFO + "_" + ActionType.Pending;
export const UPDATE_CHARACTER_PUBLIC_INFO_FULFILLED =
  UPDATE_CHARACTER_PUBLIC_INFO + "_" + ActionType.Fulfilled;
export const UPDATE_CHARACTER_PUBLIC_INFO_REJECTED =
  UPDATE_CHARACTER_PUBLIC_INFO + "_" + ActionType.Rejected;

interface UpdateCharacterPublicInfoAction {
  type:
    | typeof UPDATE_CHARACTER_PUBLIC_INFO
    | typeof UPDATE_CHARACTER_PUBLIC_INFO_PENDING
    | typeof UPDATE_CHARACTER_PUBLIC_INFO_FULFILLED
    | typeof UPDATE_CHARACTER_PUBLIC_INFO_REJECTED;
  payload: EsiResponse<Response_get_characters_character_id_200>;
  meta: any;
}

export interface CharacterEsiAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const UPDATE_CHARACTER_AUTH = "UPDATE_CHARACTER_AUTH";

interface UpdateCharacterAuthAction {
  type: typeof UPDATE_CHARACTER_AUTH;
  payload: CharacterEsiAuth;
  meta: any;
}

export const DELETE_CHARACTER_AUTH = "DELETE_CHARACTER_AUTH";

interface DeleteCharacterAuthAction {
  type: typeof DELETE_CHARACTER_AUTH;
  payload: number;
  meta: any;
}

export const UPDATE_API_STATE = "UPDATE_API_STATE";

interface UpdateApiStateAction {
  type: typeof UPDATE_API_STATE;
  payload: ApiState;
  meta: any;
}

export type CharacterActionTypes =
  | UpdateCharacterPublicInfoAction
  | UpdateCharacterAuthAction
  | DeleteCharacterAuthAction
  | UpdateApiStateAction;
