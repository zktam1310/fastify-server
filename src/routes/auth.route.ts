import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { loginBodySchema, registerBodySchema, twoFABodySchema } from '../validators/auth.validator';
import { API_ROUTE } from '../constants';
import { loginController, registerController, twoFAController } from '../controllers/auth.controller';
import { ILoginBody, IRegisterBody, ITwoFABody } from '../interfaces/auth.interface';


const AuthRoutePlugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  const base = API_ROUTE + "/auth";

  fastify.post<{ Body: ILoginBody }>(base+ '/login', {
    schema: loginBodySchema,
    handler: async (request, reply) => {
      return loginController(fastify, request, reply);
    },
  });

  fastify.post<{ Body: IRegisterBody }>(base+ '/register', {
    schema: registerBodySchema,
    handler: async (request, reply) => {
      return registerController(fastify, request, reply);
    },
  });

  fastify.post<{ Body: ITwoFABody }>(base+ '/twoFA', {
    schema: twoFABodySchema,
    validatorCompiler: ({ schema, method, url, httpPart }) => {
      return data => schema.validate(data)
    },
    handler: async (request, reply) => {
      return twoFAController(fastify, request, reply);
    },
  });

  done();
};


export default AuthRoutePlugin;
