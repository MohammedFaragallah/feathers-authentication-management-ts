import { randomBytes } from './random-bytes';

export const getLongToken = (len: number) => randomBytes(len);
