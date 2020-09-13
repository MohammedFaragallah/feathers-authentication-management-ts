import errors from '@feathersjs/errors';
import { Application } from '@feathersjs/feathers';
import makeDebug from 'debug';
import { checkUnique } from './check-unique';
import { sanitizeUserForClient } from './helpers';
import hooks from './hooks';
import { identityChange } from './identity-change';
import { passwordChange } from './password-change';
import { resendVerifySignup } from './resend-verify-signup';
import {
	resetPwdWithLongToken,
	resetPwdWithShortToken,
} from './reset-password';
import { sendResetPwd } from './send-reset-pwd';
import { Actions, Options } from './types';
import {
	verifySignupWithLongToken,
	verifySignupWithShortToken,
} from './verify-signup';
import {
	verifySignupSetPasswordWithLongToken,
	verifySignupSetPasswordWithShortToken,
} from './verify-signup-set-password';

// import { addVerification, isVerified, removeVerification } from './hooks';
const passwordField = 'password';
const debug = makeDebug('authLocalManagement:service');

const optionsDefault: Omit<Options, 'app'> & { app: null } = {
	app: null, // value set during configuration
	service: '/users', // need exactly this for test suite
	path: 'authManagement',
	notifier: () => {},
	longTokenLen: 15, // token's length will be twice this
	shortTokenLen: 6,
	shortTokenDigits: true,
	resetDelay: 1000 * 60 * 60 * 2, // 2 hours
	delay: 1000 * 60 * 60 * 24 * 5, // 5 days
	identifyUserProps: ['email'],
	skipIsVerifiedCheck: false,
	sanitizeUserForClient,
};

export default function authenticationLocalManagement(
	options1: Partial<Options> = {},
) {
	debug('service being configured.');

	return function (this: Application) {
		const options: Options = Object.assign({}, optionsDefault, options1, {
			app: this,
		});
		options.app.use(options.path, authLocalMgntMethods(options));
	};
}

authenticationLocalManagement.hooks = hooks;

export const authLocalMgntMethods = (options: Options) => {
	return {
		create(data: Actions): Promise<any> {
			debug(`create called. action=${data.action}`);

			switch (data.action) {
				case 'checkUnique':
					return checkUnique(
						options,
						data.value,
						data.ownId || null,
						data.meta || {},
					);

				case 'resendVerifySignup':
					return resendVerifySignup(options, data.value, data.notifierOptions);

				case 'verifySignupLong':
					return verifySignupWithLongToken(options, data.value);

				case 'verifySignupShort':
					return verifySignupWithShortToken(
						options,
						data.value.token,
						data.value.user,
					);

				case 'verifySignupSetPasswordLong':
					return verifySignupSetPasswordWithLongToken(
						options,
						data.value.token,
						data.value.password,
						passwordField,
					);

				case 'verifySignupSetPasswordShort':
					return verifySignupSetPasswordWithShortToken(
						options,
						data.value.token,
						data.value.user,
						data.value.password,
						passwordField,
					);

				case 'sendResetPwd':
					return sendResetPwd(
						options,
						data.value,
						data.notifierOptions,
						passwordField,
					);

				case 'resetPwdLong':
					return resetPwdWithLongToken(
						options,
						data.value.token,
						data.value.password,
						passwordField,
					);

				case 'resetPwdShort':
					return resetPwdWithShortToken(
						options,
						data.value.token,
						data.value.user,
						data.value.password,
						passwordField,
					);

				case 'passwordChange':
					return passwordChange(
						options,
						data.value.user,
						data.value.oldPassword,
						data.value.password,
						passwordField,
					);

				case 'identityChange':
					return identityChange(
						options,
						data.value.user,
						data.value.password,
						data.value.changes,
					);

				case 'options':
					return Promise.resolve(options);

				default:
					// @ts-ignore
					throw new errors.BadRequest(`Action '${data.action}' is invalid.`, {
						errors: { $className: 'badParams' },
					});
			}
		},
	};
};
