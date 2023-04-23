import { EUserRole, IUser } from '../interfaces/user.interface';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ETwoFAStep, IJwtPayload, ILoginBody, IRegisterBody, ITwoFABody } from '../interfaces/auth.interface';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as CryptoJS from 'crypto-js';
import environments from '../environments';

dayjs.extend(utc);

export const loginController = async (fastify: FastifyInstance, request: FastifyRequest<{ Body: ILoginBody }>, reply: FastifyReply) => {
  const { email, password, step, code } = request.body;
  const users = fastify.mongo.db.collection<IUser>("users");

  try {
    const user = await users.findOne({ email });
    if (!user || user.password !== password)
      return reply.status(401).send({
        statusCode: 401,
        error: "Authentication Failed",
        message: "Invalid email/password."
      });

    let response;

    const token = getJwtToken(user._id, user.email, fastify);

    if (!user.twoFA) {
      response = {
        ...user,
        token
      }
    } else {
      switch (step) {
        case 1:
          response = {
            activeTwoFA: true
          }
          break;
        case 2:

          break;

      }
    }


    reply.code(201).send(response);

  } catch (err) {
    reply.code(500).send(err);
  }
}

export const registerController = async (fastify: FastifyInstance, request: FastifyRequest<{ Body: IRegisterBody }>, reply: FastifyReply) => {
  const { email, password } = request.body;
  const user: IUser = {
    email,
    password,
    role: EUserRole.NonSubscriber,
    updatedAt: dayjs.utc().toDate(),
    createdAt: dayjs.utc().toDate(),
  };
  const users = fastify.mongo.db.collection<IUser>("users");

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser)
      return reply.status(409).send({
        statusCode: 409,
        error: "Registration Failed",
        message: "This email has already been registered."
      });

    const result = await users.insertOne(user);
    reply.code(201).send(result);
  } catch (err) {
    reply.code(500).send(err);
  }
}

export const twoFAController = async (fastify: FastifyInstance, request: FastifyRequest<{ Body: ITwoFABody }>, reply: FastifyReply) => {
  const { step, code } = request.body;
  const { email } = request.user as IJwtPayload;
  const users = fastify.mongo.db.collection<IUser>("users");

  try {
    const user = await users.findOne({ email });
    if (!user)
      return reply.status(401).send({
        statusCode: 404,
        error: "User Not Found",
        message: "Invalid user."
      });

    let response;

    let decryptedSecret;
    let twoFAValidated;
    switch (step) {
      case ETwoFAStep.Enable:
        if (user.twoFA && user.twoFA.secret && user.twoFA.verified)
          return reply.status(401).send({
            statusCode: 404,
            error: "Two FA Error",
            message: "User has an active Two FA."
          });

        const twoFASecret = await generateTwoFASecret(email);
        const encryptedSecret = CryptoJS.AES.encrypt(twoFASecret.secret, environments.TWOFA_ENCRYPT_KEY).toString();
        await users.findOneAndUpdate({ email }, {
          $set: {
            twoFA: {
              verified: false,
              secret: encryptedSecret
            }
          }
        })
        response = {
          qrUrl: twoFASecret.qrUrl
        }
        break;

      case ETwoFAStep.Confirm:
        if (!user.twoFA || !user.twoFA.secret)
          return reply.status(401).send({
            statusCode: 404,
            error: "Two FA Error",
            message: "User has not configured Two FA yet."
          });

        decryptedSecret = CryptoJS.AES.decrypt(user.twoFA.secret, environments.TWOFA_ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);

        twoFAValidated = validateTwoFA({
          code: code,
          secret: decryptedSecret
        });

        if (twoFAValidated) {
          await users.findOneAndUpdate({ email }, {
            $set: {
              'twoFA.verified': true
            }
          })
          response = {
            success: true
          }
        } else
          response = {
            success: false
          }
        break;

      case ETwoFAStep.Disable:
        if (!user.twoFA || !user.twoFA.secret)
          return reply.status(401).send({
            statusCode: 404,
            error: "Two FA Error",
            message: "User has not configured Two FA yet."
          });

        decryptedSecret = CryptoJS.AES.decrypt(user.twoFA.secret, environments.TWOFA_ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);

        twoFAValidated = validateTwoFA({
          code: code,
          secret: decryptedSecret
        });

        if (twoFAValidated) {
          await users.findOneAndUpdate({ email }, {
            $set: {
              twoFA: undefined
            }
          })
          response = {
            success: true
          }
        } else
          response = {
            success: false
          }
        break;


    }


    reply.code(201).send(response);

  } catch (err) {
    reply.code(500).send(err);
  }
}

const generateTwoFASecret = async (email: string) => {
  const generateSecret = speakeasy.generateSecret();

  const otpauth_url = speakeasy.otpauthURL({
    secret: generateSecret.ascii,
    label: `Fastify Server (${email})`,
  })

  const qrUrl = await qrcode.toDataURL(otpauth_url);

  return {
    qrUrl,
    secret: generateSecret.ascii
  }
}

const validateTwoFA = (data: any) => {
  return speakeasy.totp.verify({
    secret: data.secret,
    encoding: 'ascii',
    token: data.code,
  })
}

const getJwtToken = (id: any, email: string, fastify: FastifyInstance) => {
  const signPayload = {
    email,
    id
  };
  return fastify.jwt.sign(signPayload);
}