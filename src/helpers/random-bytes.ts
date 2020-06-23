import crypto from 'crypto';
import { Token } from '../types';

export const randomBytes = (len: number): Promise<Token> =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(len, (err, buf) =>
      err ? reject(err) : resolve(buf.toString('hex'))
    );
  });
