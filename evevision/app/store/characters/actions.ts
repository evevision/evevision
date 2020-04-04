import {
    CharacterEsiAuth,
    UPDATE_CHARACTER_AUTH,
    UPDATE_CHARACTER_PUBLIC_INFO,
    DELETE_CHARACTER_AUTH,
    UPDATE_API_STATE,
    ApiState
} from "./types";
import { createAliasedAction } from 'electron-redux';
import { getCharacter } from "../../esi/client";

export const updateApiState = (characterId: number, apiState: ApiState) => {
    return {
        type: UPDATE_API_STATE,
        payload: apiState,
        meta: {characterId}
    }
}

export const updateCharacterPublicInfo = createAliasedAction(
    UPDATE_CHARACTER_PUBLIC_INFO,
    (characterId: number) => {
        return  ({
            type: UPDATE_CHARACTER_PUBLIC_INFO,
            payload: getCharacter(characterId),
            meta: {characterId}
        })
    }
);

export const updateCharacterAuth = (auth: CharacterEsiAuth, characterId: number) => {
    return {
        type: UPDATE_CHARACTER_AUTH,
        payload: auth,
        meta: {characterId}
    }
}

export const deleteCharacterAuth = (characterId: number) => {
    return {
        type: DELETE_CHARACTER_AUTH,
        payload: characterId,
        meta: {characterId}
    }
}