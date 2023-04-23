import { ETwoFAStep } from "../interfaces/auth.interface"
import Joi from "joi";

export const loginBodySchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
  },
}

export const registerBodySchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
  },
}

export const twoFABodySchema = {
  body: Joi.object().keys({
    step: Joi.number()
      .valid(...Object.values(ETwoFAStep).filter((i: any) => typeof i == "number"))
      .required(),
    code: Joi.string()
      .length(6)
      .when('step', {
          is: Joi.valid(ETwoFAStep.Confirm, ETwoFAStep.Disable), then: Joi.required()
        }),
  })
}
