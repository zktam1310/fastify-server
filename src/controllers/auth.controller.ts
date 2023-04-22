import { EUserRole, IUser } from '../interfaces/user.interface';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ILoginBody, IRegisterBody } from '../interfaces/auth.interface';

dayjs.extend(utc);

export const loginController = async (fastify: FastifyInstance ,request: FastifyRequest<{ Body: ILoginBody }>, reply: FastifyReply) => {
  const { email, password } = request.body;
  const users = fastify.mongo.db.collection<IUser>("users");

  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser || existingUser.password !== password)
      return reply.status(401).send({
        statusCode: 401,
        error: "Authentication Failed",
        message: "Invalid email/password."
      });

    reply.code(201).send(existingUser);
  } catch (err) {
    reply.code(500).send(err);
  }
}

export const registerController = async (fastify: FastifyInstance ,request: FastifyRequest<{ Body: IRegisterBody }>, reply: FastifyReply) => {
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