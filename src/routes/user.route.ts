import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { API_ROUTE } from '../constants';
import { meController } from '../controllers/user.controller';


const UserRoutePlugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  const base = API_ROUTE + "/users";

  fastify.get(base + '/me', {
    handler: async (request, reply) => {
      return meController(fastify, request, reply);
    },
  })

  done();
};

export default UserRoutePlugin;
