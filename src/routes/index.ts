import AuthRoutePlugin from "./auth.route";
import UserRoutePlugin from "./user.route";
import WebsocketRoutePlugin from "./websocket.route";

const routesPlugin = [
  AuthRoutePlugin,
  UserRoutePlugin,
  WebsocketRoutePlugin
]

export default routesPlugin;
