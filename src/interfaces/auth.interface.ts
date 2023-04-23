export interface ILoginBody {
  email: string;
  password: string;
  step: ELoginStep;
  code?: string;
}

export interface IRegisterBody {
  email: string;
  password: string
}

export interface ITwoFABody {
  step: ETwoFAStep;
  code?: string;
}

export interface IJwtPayload {
  email: string;
  id: string;
  iat: number
}

export enum ELoginStep {
  Primary = 1,
  TwoFA = 2
}

export enum ETwoFAStep {
  Enable = 1,
  Confirm = 2,
  Disable = 3
}