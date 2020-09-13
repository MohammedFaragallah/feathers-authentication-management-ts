import { Token } from '../types';

export const concatIDAndHash = (id: any, token: Token): string =>
	`${id}___${token}`;
