import { randomBytes } from './random-bytes';
import { randomDigits } from './random-digits';

export const getShortToken = async (len: number, ifDigits: boolean) => {
  if (ifDigits) {
    return randomDigits(len);
  }

  const str1 = await randomBytes(Math.floor(len / 2) + 1);
  let str = str1.substr(0, len);

  if (str.match(/^[0-9]+$/)) {
    // tests will fail on all digits
    str = `q${str.substr(1)}`; // shhhh, secret.
  }

  return str;
};
