import Esi, {
  Response_get_characters_character_id_200,
  Response_get_search_200,
} from "./esi";

export interface EsiError {
  message: string;
  error: string | null;
}

type ClientResponse<T> = Promise<T | EsiError>;

export function getCharacter(
  characterId: number
): ClientResponse<Response_get_characters_character_id_200> {
  return new Promise<Response_get_characters_character_id_200 | EsiError>(
    (resolve, reject) => {
      new Esi()
        .get_characters_character_id({ characterId: characterId })
        .then((success) => {
          switch (success.status) {
            case 200:
              return resolve(
                success.body as Response_get_characters_character_id_200
              );
            case 304:
              return reject({
                message: "ETag response received when not using etags",
                error: null,
              } as EsiError);
            default:
              return reject({
                message: "Unknown response while retrieving characters",
                error: null,
              } as EsiError);
          }
        })
        .catch((failure) => {
          switch (failure.status) {
            case 404:
              return reject({
                message: "Character not found",
                error: null,
              } as EsiError);
            case 400:
            case 420:
            case 500:
            case 503:
            case 504:
              return reject({
                message: "System error while retrieving characters",
                error: failure.response.body.error,
              } as EsiError);
            default:
              return reject({
                message: "Unknown response while retrieving characters",
                error: null,
              } as EsiError);
          }
        });
    }
  );
}

export function getCharacterIdByName(
  characterName: string
): ClientResponse<number> {
  return new Promise<number | EsiError>((resolve, reject) => {
    new Esi()
      .get_search({
        categories: ["character"],
        search: characterName,
        strict: true,
      })
      .then(async (success) => {
        switch (success.status) {
          case 200:
            const response = success.body as Response_get_search_200;
            if (response.character !== undefined) {
              if (response.character.length === 1) {
                return resolve(response.character.pop());
              } else {
                // figure out which is the right one
                for (const cid of response.character) {
                  const char = (await getCharacter(
                    cid
                  )) as Response_get_characters_character_id_200;
                  if (char.name === characterName) {
                    return resolve(cid);
                  }
                }
                return reject({
                  message:
                    "ESI returned other characters but not the one we want",
                  error: null,
                } as EsiError);
              }
            } else {
              return reject({
                message: "Missing character array in response",
                error: null,
              } as EsiError);
            }
          case 304:
            return reject({
              message: "ETag response received when not using etags",
              error: null,
            } as EsiError);
          default:
            return reject({
              message: "Unknown response while searching for character",
              error: null,
            } as EsiError);
        }
      })
      .catch((failure) => {
        switch (failure.status) {
          case 404:
            return reject({
              message: "Character not found",
              error: null,
            } as EsiError);
          case 400:
          case 420:
          case 500:
          case 503:
          case 504:
            return reject({
              message: "System error while retrieving characters",
              error: failure.response.body.error,
            } as EsiError);
          default:
            return reject({
              message: "Unknown response while retrieving characters",
              error: null,
            } as EsiError);
        }
      });
  });
}
