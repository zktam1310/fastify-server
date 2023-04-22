export interface ILoginBody {
  email: string;
  password: string;
}

export interface IRegisterBody {
  email: string;
  password: string
}

export interface IJwtPayload {
  email: string;
  id: string;
  iat: number
}