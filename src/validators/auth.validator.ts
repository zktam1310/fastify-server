import { ELoginStep, ETwoFAStep } from "../interfaces/auth.interface"
import Joi from "joi";

export const loginBodySchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    step: Joi.number()
      .valid(...Object.values(ELoginStep).filter((i: any) => typeof i == "number"))
      .required(),
    code: Joi.string()
      .length(6)
      .when('step', {
          is: ELoginStep.TwoFA, then: Joi.required()
        }),
  })
}

export const registerBodySchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required()
  })
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
