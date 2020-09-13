import crypto from 'crypto';
import { Token } from '../types';

export const randomDigits = (len: number): Token => {
	let str = '';

	while (str.length < len) {
		str += parseInt('0x' + crypto.randomBytes(4).toString('hex')).toString();
	}

	return str.substr(0, len);
};
