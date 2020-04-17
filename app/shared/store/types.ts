import { EsiError } from "../esi/client";

export type PromiseOrValue<T> = Promise<T> | T;
export type EsiResponse<T> = PromiseOrValue<T | EsiError | null>;
