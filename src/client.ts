import { AuthenticationClient } from '@feathersjs/authentication-client';
import { Application } from '@feathersjs/feathers';

import {
	AuthManagementService,
	NotifierOptions,
	Options,
	OwnId,
	Types,
	User,
	Token,
	Password,
} from './types';

declare module '@feathersjs/feathers' {
	interface Application {
		authenticate: AuthenticationClient['authenticate'];
		logout: AuthenticationClient['logout'];
	}
}

// Wrapper for client interface to feathers-authenticate-management
export default class AuthManagement {
	authManagement!: AuthManagementService;
	app!: Application;

	constructor(app: Application, options?: Options) {
		if (!(this instanceof AuthManagement)) {
			return new AuthManagement(app);
		}

		this.authManagement = app.service(options?.path || 'authManagement');
		this.app = app;
	}

	checkUnique(identifyUser: User, ownId: OwnId, noErrMsg: boolean) {
		return this.authManagement.create({
			action: Types.checkUnique,
			value: identifyUser,
			ownId,
			meta: { noErrMsg },
		});
	}

	resendVerifySignup(identifyUser: User, notifierOptions: NotifierOptions) {
		return this.authManagement.create({
			action: Types.resendVerifySignup,
			value: identifyUser,
			notifierOptions,
		});
	}

	verifySignupLong(verifyToken: Token) {
		return this.authManagement.create({
			action: Types.verifySignupLong,
			value: verifyToken,
		});
	}

	verifySignupShort(verifyShortToken: Token, identifyUser: User) {
		return this.authManagement.create({
			action: Types.verifySignupShort,
			value: { user: identifyUser, token: verifyShortToken },
		});
	}

	sendResetPwd(identifyUser: User, notifierOptions?: NotifierOptions) {
		return this.authManagement.create({
			action: Types.sendResetPwd,
			value: identifyUser,
			notifierOptions,
		});
	}

	resetPwdLong(resetToken: Token, password: Password) {
		return this.authManagement.create({
			action: Types.resetPwdLong,
			value: { token: resetToken, password },
		});
	}

	resetPwdShort(
		resetShortToken: Token,
		identifyUser: User,
		password: Password,
	) {
		return this.authManagement.create({
			action: Types.resetPwdShort,
			value: {
				user: identifyUser,
				token: resetShortToken,
				password,
			},
		});
	}

	passwordChange(
		oldPassword: Password,
		password: Password,
		identifyUser: User,
	) {
		return this.authManagement.create({
			action: Types.passwordChange,
			value: { user: identifyUser, oldPassword, password },
		});
	}

	identityChange(
		password: Password,
		changesIdentifyUser: User,
		identifyUser: User,
	) {
		return this.authManagement.create({
			action: Types.identityChange,
			value: {
				user: identifyUser,
				password,
				changes: changesIdentifyUser,
			},
		});
	}

	async authenticate(
		email: string,
		password: Password,
		cb: (err: Error | null, user?: User) => void,
	) {
		let cbCalled = false;

		return this.app
			.authenticate({ type: 'local', email, password })
			.then((result) => {
				const user = result.data;

				if (!user || !user.isVerified) {
					this.app.logout();
					return cb(
						new Error(
							user ? "User's email is not verified." : 'No user returned.',
						),
					);
				}

				if (cb) {
					cbCalled = true;
					return cb(null, user);
				}

				return user;
			})
			.catch((err) => {
				if (!cbCalled) {
					cb(err);
				}
			});
	}
}
