import {
  ApiState,
  CharacterActionTypes,
  CharacterEsiAuth,
  CharacterState,
  DELETE_CHARACTER_AUTH,
  UPDATE_API_STATE,
  UPDATE_CHARACTER_AUTH,
  UPDATE_CHARACTER_PUBLIC_INFO_FULFILLED,
  UPDATE_CHARACTER_PUBLIC_INFO_REJECTED
} from "./types";
import { Response_get_characters_character_id_200 } from "../../esi/esi";
import { EsiError } from "../../esi/client";

const initialState: CharacterState = {
  characters: [],
  error: null
};

function mergeCharacter(
  currentState: CharacterState,
  characterInfo: any
): CharacterState {
  if (currentState.characters.map(c => c.id).includes(characterInfo.id)) {
    // already exists, merge
    return {
      ...currentState,
      characters: currentState.characters.map(character => {
        if (character.id === characterInfo.id) {
          return Object.assign(character, characterInfo);
        } else {
          return character;
        }
      })
    };
  } else {
    // doesn't exist yet, add it
    return {
      ...currentState,
      characters: currentState.characters.concat([characterInfo])
    };
  }
}

export function characterReducer(
  state = initialState,
  action: CharacterActionTypes
): CharacterState {
  const { type, payload, meta } = action;
  switch (type) {
    case UPDATE_CHARACTER_PUBLIC_INFO_FULFILLED:
      const esiCharacter = payload as Response_get_characters_character_id_200;
      return mergeCharacter(state, {
        id: meta.characterId,
        public: {
          name: esiCharacter.name,
          corporation_id: esiCharacter.corporation_id,
          alliance_id: esiCharacter.alliance_id,
          security_status: esiCharacter.security_status
        }
      });
    case UPDATE_CHARACTER_PUBLIC_INFO_REJECTED:
      return { ...state, error: payload as EsiError };
    case UPDATE_CHARACTER_AUTH:
      return mergeCharacter(state, {
        id: meta.characterId,
        auth: payload as CharacterEsiAuth
      });
    case DELETE_CHARACTER_AUTH:
      return mergeCharacter(state, {
        id: payload as number,
        auth: undefined
      });
    case UPDATE_API_STATE:
      return mergeCharacter(state, {
        id: meta.characterId,
        apiState: payload as ApiState
      });
    default:
      return state;
  }
}
