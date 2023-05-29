import fastify, { FastifyInstance } from "fastify";
import fastifyMongodb from '@fastify/mongodb';
import fastifyJwt from '@fastify/jwt';
import fastifyJoi from 'fastify-joi';
import fastifyWebsocket, { SocketStream } from "@fastify/websocket";
import environments from "./environments";
import routesPlugin from './routes';
import { FastifyRequest, FastifyReply } from "fastify";

class App {
  server: FastifyInstance | any;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const envToLogger = {
      development: {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
      production: true,
      test: false,
    }

    this.server = fastify({
      logger: envToLogger["development"]
    });

    this.registerPlugins();
    this.registerRoutes();
  }

  private async registerPlugins() {
    this.server.register(fastifyWebsocket);

    this.server.register((fastifyMongodb), { url: environments.MONGO_URI });

    this.server.register(fastifyJwt, {
      secret: environments.JWT_SECRET
    })

    this.server.register(fastifyJoi);

    this.server.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.ws) {
        try {
          const { authorization }  = request.headers;
          const token = authorization?.replace("Bearer ", "");
          await this.server.jwt.verify(token);
        } catch (err) {
          reply.send(err.message);
        }
      } else {
        const publicRoutes = [
          "auth/login",
          "auth/register"
        ]
        if (publicRoutes.includes(request.url.replace("/api/v1/", ""))) return;

        try {
          await request.jwtVerify()
        } catch (err) {
          reply.send(err)
        }
      }
    })
  }

  private registerRoutes() {
    // Register route plugins
    for (let route of routesPlugin) {
      this.server.register(route);
    }

  }

  public async start() {
    try {
      await this.server.listen({ port: Number(environments.PORT) });
    } catch (err) {
      this.server.log.error(err);
      process.exit(1);
    }
  }

}

export default App;
