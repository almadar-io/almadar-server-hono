import type { DecodedIdToken } from 'firebase-admin/auth';

export interface UserContext {
  uid: string;
  email?: string;
  orgId?: string;
  roles: string[];
  sessionId?: string;
}

export type FirebaseVariables = {
  firebaseUser: DecodedIdToken;
};

export type UserContextVariables = FirebaseVariables & {
  user: UserContext;
  userContext: UserContext;
};

export type AppEnv = { Variables: FirebaseVariables };
export type FirebaseEnv = { Variables: FirebaseVariables };
export type FullUserEnv = { Variables: UserContextVariables };
