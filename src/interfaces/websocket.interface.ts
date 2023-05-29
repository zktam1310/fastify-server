export enum EWebSocketEvents {
  Event1 = "event-1",
  Event2 = "event-2"
}

export interface IWebsocketMessage {
  event: EWebSocketEvents,
  payload: any
}
