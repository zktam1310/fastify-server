export enum EUserRole {
  NonSubscriber = "non-subscriber",
  Subscriber = "subscriber",
  Premium = "premium"
}

interface ITwoFA {
  hasVerified: boolean;
  secret: string;
}

export interface IUser {
  email: string;
  password: string;
  role: EUserRole;
  twoFA?: ITwoFA;
  updatedAt: Date;
  createdAt: Date;
}
