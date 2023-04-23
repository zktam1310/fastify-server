export interface ILoginBody {
  email: string;
  password: string;
  step: number;
  code?: string;
}

export interface IRegisterBody {
  email: string;
  password: string
}

export enum ETwoFAStep {
  Enable = 1,
  Confirm = 2,
  Disable = 3
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