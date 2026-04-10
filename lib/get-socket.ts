import { Server as ServerIO } from "socket.io";

type GlobalWithSocket = typeof globalThis & {
  io?: ServerIO;
};

export const getSocketServer = () =>
  (globalThis as GlobalWithSocket).io;

export const setSocketServer = (io: ServerIO) => {
  (globalThis as GlobalWithSocket).io = io;
  return io;
};
