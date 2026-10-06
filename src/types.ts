import type { VerifiedUser } from '@almadar/auth';

export interface UserContext {
  uid: string;
  email?: string;
  orgId?: string;
  roles: string[];
  sessionId?: string;
}

export type FirebaseVariables = {
  /** Set by the auth middlewares; absent on an anonymous request through `identifyBearer`. */
  authUser: VerifiedUser | undefined;
};

export type UserContextVariables = FirebaseVariables & {
  user: UserContext;
  userContext: UserContext;
};

export type AppEnv = { Variables: FirebaseVariables };
export type FirebaseEnv = { Variables: FirebaseVariables };
export type FullUserEnv = { Variables: UserContextVariables };
