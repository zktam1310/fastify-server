import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import environments from '../environments';
import { IJwtPayload } from '../interfaces/auth.interface';

dayjs.extend(utc);

export const meController = async (fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.user as IJwtPayload;

  const users = fastify.mongo.db.collection<IUser>("users");

  try {
    const user = await users.findOne({ email });
    reply.code(201).send(user);
  } catch (err) {
    reply.code(500).send(err);
  }
}
