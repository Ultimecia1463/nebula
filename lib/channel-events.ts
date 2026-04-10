import { EventEmitter } from "events";
import { ChannelMessage } from "@/types/chat";

type ChannelEvent =
  | {
      type: "message.created";
      payload: ChannelMessage;
    };

type ChannelEventsBus = EventEmitter & {
  emit: (eventName: string, event: ChannelEvent) => boolean;
  on: (eventName: string, listener: (event: ChannelEvent) => void) => ChannelEventsBus;
  off: (eventName: string, listener: (event: ChannelEvent) => void) => ChannelEventsBus;
};

type GlobalWithChannelEvents = typeof globalThis & {
  __channelEvents__?: ChannelEventsBus;
};

const getBus = () => {
  const globalWithEvents = globalThis as GlobalWithChannelEvents;

  if (!globalWithEvents.__channelEvents__) {
    const emitter = new EventEmitter() as ChannelEventsBus;
    emitter.setMaxListeners(0);
    globalWithEvents.__channelEvents__ = emitter;
  }

  return globalWithEvents.__channelEvents__;
};

const getChannelEventName = (channelId: string) => `channel:${channelId}`;

export const publishChannelMessageCreated = (
  channelId: string,
  message: ChannelMessage
) => {
  getBus().emit(getChannelEventName(channelId), {
    type: "message.created",
    payload: message,
  });
};

export const subscribeToChannelEvents = (
  channelId: string,
  listener: (event: ChannelEvent) => void
) => {
  const bus = getBus();
  const eventName = getChannelEventName(channelId);

  bus.on(eventName, listener);

  return () => {
    bus.off(eventName, listener);
  };
};
