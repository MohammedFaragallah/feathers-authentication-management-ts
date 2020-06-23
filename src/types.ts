import { Application } from '@feathersjs/feathers';
import { authLocalMgntMethods } from './service';

export type OwnId = any;
export type Token = string;
export type Password = string;
export type NotifierOptions = any;
export type Tokens = { [key: string]: Token };
export type Changes = { [key in keyof User]: User[key] };
export type AuthManagementService = ReturnType<typeof authLocalMgntMethods>;

export interface Meta {
  noErrMsg: boolean;
}

export type Notifier = (
  type: Types,
  user: User,
  notifierOptions?: NotifierOptions
) => any;

export interface User {
  [key: string]: any;
  /**
   * If the user's email addr has been verified
   */
  isVerified?: boolean;
  /**
   * The 30-char token generated for email addr verification
   */
  verifyToken?: Token;
  /**
   * The 6-digit token generated for cellphone addr verification
   */
  verifyShortToken?: Token;
  /**
   * When the email addr token expire
   */
  verifyExpires?: Date;
  /**
   * New values to apply on verification to some identifyUserProps
   */
  verifyChanges?: string[];
  /**
   * The 30-char token generated for forgotten password reset
   */
  resetToken?: Token;
  /**
   * The 6-digit token generated for forgotten password reset
   */
  resetShortToken?: Token;
  /**
   * When the forgotten password token expire
   */
  resetExpires?: Date;
  /**
   * The preferred way to notify the user. One of identifyUserProps.
   */
  preferredComm?: string;
}

export interface Options {
  /**
   * The path of the service for user items, e.g. /users (default) or /organization.
   */
  service: string;
  /**
   * The path to associate with this service. Default authManagement. See Multiple services for more information.
   */
  path: string;
  /**
   * if true (default) it is impossible to reset password if email is not verified.
   */
  skipIsVerifiedCheck: boolean;
  /**
   * function(type, user, notifierOptions) returns a Promise.
   */
  notifier: Notifier;
  /**
   * Half the length of the long token. Default is 15, giving 30-char tokens.
   */
  longTokenLen: number;
  /**
   * Length of short token. Default is 6.
   */
  shortTokenLen: number;
  /**
   * Short token is digits if true, else alphanumeric. Default is true.
   */
  shortTokenDigits: boolean;
  /**
   * Duration for sign up email verification token in ms. Default is 5 days.
   */
  delay: number;
  /**
   * Duration for password reset token in ms. Default is 2 hours.
   */
  resetDelay: number;
  /**
   * Prop names in user item which uniquely identify the user, e.g. ['username', 'email', 'cellphone']. The default is ['email']. The prop values must be strings. Only these props may be changed with verification by the service. At least one of these props must be provided whenever a short token is used, as the short token alone is too susceptible to brute force attack.
   */
  identifyUserProps: string[]; //? keyof User!
  /**
   * feathers application
   */
  app: Application;
  sanitizeUserForClient: (user: User) => Partial<typeof user>;
}

export enum Types {
  resendVerifySignup = 'resendVerifySignup',
  verifySignup = 'verifySignup',
  sendResetPwd = 'sendResetPwd',
  resetPwd = 'resetPwd',
  passwordChange = 'passwordChange',
  identityChange = 'identityChange',

  checkUnique = 'checkUnique',
  verifySignupLong = 'verifySignupLong',
  verifySignupShort = 'verifySignupShort',
  resetPwdLong = 'resetPwdLong',
  resetPwdShort = 'resetPwdShort',
  options = 'options',

  verifySignupSetPassword = 'verifySignupSetPassword',
  verifySignupSetPasswordLong = 'verifySignupSetPasswordLong',
  verifySignupSetPasswordShort = 'verifySignupSetPasswordShort',
}

export interface CheckUnique {
  action: Types.checkUnique;
  value: User;
  ownId: OwnId;
  meta: Meta;
}
export interface ResendVerifySignup {
  action: Types.resendVerifySignup;
  value: User;
  notifierOptions: NotifierOptions;
}
export interface VerifySignupLong {
  action: Types.verifySignupLong;
  value: Token;
}
export interface VerifySignupShort {
  action: Types.verifySignupShort;
  value: { user: User; token: Token };
}
export interface VerifySignupSetPasswordLong {
  action: Types.verifySignupSetPasswordLong;
  value: { token: Token; password: Password };
}
export interface VerifySignupSetPasswordShort {
  action: Types.verifySignupSetPasswordShort;
  value: { token: Token; password: Password; user: User };
}
export interface SendResetPwd {
  action: Types.sendResetPwd;
  value: User;
  notifierOptions: NotifierOptions;
  passwordField?: string;
}
export interface ResetPwdLong {
  action: Types.resetPwdLong;
  value: { token: Token; password: Password };
}
export interface ResetPwdShort {
  action: Types.resetPwdShort;
  value: { token: Token; password: Password; user: User };
}
export interface PasswordChange {
  action: Types.passwordChange;
  value: { oldPassword: Password; password: Password; user: User };
}
export interface IdentityChange {
  action: Types.identityChange;
  value: { changes: Changes; password: Password; user: User };
}
export interface GetOptions {
  action: Types.options;
}

export type Actions =
  | CheckUnique
  | ResendVerifySignup
  | VerifySignupLong
  | VerifySignupShort
  | VerifySignupSetPasswordLong
  | VerifySignupSetPasswordShort
  | SendResetPwd
  | ResetPwdLong
  | ResetPwdShort
  | PasswordChange
  | IdentityChange
  | GetOptions;
