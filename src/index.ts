import fastify from 'fastify';
import environments from './environments';
import routesPlugin from './routes';
import fastifyMongodb from '@fastify/mongodb';

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

const server = fastify({
  logger: envToLogger["development"]
});

// Add a signal handler to gracefully shut down the server when it receives SIGTERM
process.on('SIGTERM', () => {
  console.log('Server is being shut down...');
  server.close(() => {
    console.log('Server has been shut down successfully');
    process.exit(0);
  });
});

server.register((fastifyMongodb), { url: environments.MONGO_URI});

// Register route plugins
for (let route of routesPlugin) {
  server.register(route);
}

const start = async () => {
  try {
    await server.listen({ port: Number(environments.PORT) });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
start();
