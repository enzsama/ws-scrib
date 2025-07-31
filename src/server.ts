import { WebSocketServer } from "ws";
import { createYjsServer } from "yjs-server";
import * as Y from "yjs";
import docStorage from "./utils/docStorage.js";
import authorize from "./utils/authorize.js";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
const yjss = createYjsServer({
  createDoc: () => new Y.Doc(),
  docStorage: docStorage,
});

wss.on("connection", (ws, request) => {
  ws.on("error", console.error);

  const isAuthorized = authorize(ws, request).catch((error) => {
    console.log(error);
    ws.close(4001);
    return false;
  });

  yjss.handleConnection(ws, request, isAuthorized);
});
