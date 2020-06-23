import bcrypt from 'bcryptjs';
import util from 'util';

export const comparePasswords = util.promisify(bcrypt.compare);
