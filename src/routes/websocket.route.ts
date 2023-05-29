import { FastifyInstance, FastifyPluginCallback, FastifyRequest } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { EWebSocketEvents, IWebsocketMessage } from '../interfaces/websocket.interface';

const WebsocketRoutePlugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  const base = '/ws';

  fastify.get(base, { websocket: true }, async (connection: SocketStream, request: FastifyRequest) => {

    connection.socket.on("message", (message: string) => {
      try {
        const { event, payload }: IWebsocketMessage = JSON.parse(message);
        switch (event) {
          case EWebSocketEvents.Event1:
            connection.socket.send(JSON.stringify(payload));
            break;

          case EWebSocketEvents.Event2:
            connection.socket.send(event);
            break;

          default:
            connection.socket.send("Invalid event.")
        }
      } catch (err: any) {
        connection.socket.send(err.message);
      }
    })
  });

  done();
};

export default WebsocketRoutePlugin;
