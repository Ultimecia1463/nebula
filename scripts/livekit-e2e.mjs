import "dotenv/config";

import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { AccessToken } from "livekit-server-sdk";
import {
  AudioFrame,
  AudioSource,
  AudioStream,
  dispose,
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
  TrackKind,
  TrackPublishOptions,
  TrackSource,
  VideoBufferType,
  VideoFrame,
  VideoSource,
  VideoStream,
} from "@livekit/rtc-node";

const {
  LIVEKIT_URL: serverUrl,
  LIVEKIT_API_KEY: apiKey,
  LIVEKIT_API_SECRET: apiSecret,
} = process.env;

if (!serverUrl || !apiKey || !apiSecret) {
  throw new Error(
    "Missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET in the environment."
  );
}

const roomName = `nebula-e2e-${Date.now()}-${randomUUID().slice(0, 8)}`;
const publisherIdentity = `publisher-${randomUUID().slice(0, 8)}`;
const subscriberIdentity = `subscriber-${randomUUID().slice(0, 8)}`;

const audioConfig = {
  sampleRate: 48_000,
  channels: 1,
  samplesPerFrame: 480,
  framesToSend: 60,
  framesToRead: 8,
};

const videoConfig = {
  width: 320,
  height: 180,
  framesToSend: 12,
  framesToRead: 4,
  frameDelayMs: 80,
};

function createJoinToken(identity, name) {
  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: "10m",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}

function withTimeout(promise, ms, label) {
  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([
    promise.finally(() => {
      clearTimeout(timer);
    }),
    timeoutPromise,
  ]);
}

function waitForTrackSubscribed(room, expectedKind, timeoutMs = 20_000) {
  return withTimeout(
    new Promise((resolve) => {
      const handler = (track, publication, participant) => {
        if (publication?.kind !== expectedKind) {
          return;
        }

        room.off(RoomEvent.TrackSubscribed, handler);
        resolve({ track, publication, participant });
      };

      room.on(RoomEvent.TrackSubscribed, handler);
    }),
    timeoutMs,
    `Waiting for ${expectedKind === TrackKind.KIND_AUDIO ? "audio" : "video"} subscription`
  );
}

async function publishAudio(source) {
  let t = 0;
  const amplitude = Math.round(0.6 * 32767);
  const sineHz = 440;

  for (let frameIndex = 0; frameIndex < audioConfig.framesToSend; frameIndex += 1) {
    const frame = AudioFrame.create(
      audioConfig.sampleRate,
      audioConfig.channels,
      audioConfig.samplesPerFrame
    );

    for (let sample = 0; sample < audioConfig.samplesPerFrame; sample += 1) {
      const value = Math.round(
        amplitude *
          Math.sin((2 * Math.PI * sineHz * t) / audioConfig.sampleRate)
      );

      frame.data[sample] = value;
      t += 1;
    }

    await source.captureFrame(frame);
  }

  await source.waitForPlayout();
}

async function publishVideo(source) {
  for (let frameIndex = 0; frameIndex < videoConfig.framesToSend; frameIndex += 1) {
    const buffer = new Uint8Array(videoConfig.width * videoConfig.height * 4);
    const red = (frameIndex * 40) % 255;
    const green = (80 + frameIndex * 30) % 255;
    const blue = (160 + frameIndex * 20) % 255;

    for (let y = 0; y < videoConfig.height; y += 1) {
      for (let x = 0; x < videoConfig.width; x += 1) {
        const index = (y * videoConfig.width + x) * 4;
        buffer[index] = (red + x) % 255;
        buffer[index + 1] = (green + y) % 255;
        buffer[index + 2] = blue;
        buffer[index + 3] = 255;
      }
    }

    const frame = new VideoFrame(
      buffer,
      videoConfig.width,
      videoConfig.height,
      VideoBufferType.RGBA
    );

    source.captureFrame(frame);
    await delay(videoConfig.frameDelayMs);
  }
}

async function readRemoteAudio(track) {
  const stream = new AudioStream(track, {
    sampleRate: audioConfig.sampleRate,
    numChannels: audioConfig.channels,
  });
  const reader = stream.getReader();
  let framesRead = 0;
  let energy = 0;

  try {
    while (framesRead < audioConfig.framesToRead) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      for (const sample of value.data) {
        energy += Math.abs(sample);
      }

      framesRead += 1;
    }
  } finally {
    await reader.cancel();
  }

  if (framesRead < audioConfig.framesToRead) {
    throw new Error(
      `Expected ${audioConfig.framesToRead} remote audio frames, received ${framesRead}.`
    );
  }

  if (energy === 0) {
    throw new Error("Remote audio arrived but had zero energy.");
  }

  return {
    framesRead,
    energy,
  };
}

async function readRemoteVideo(track) {
  const stream = new VideoStream(track);
  const reader = stream.getReader();
  let framesRead = 0;
  const checksums = [];

  try {
    while (framesRead < videoConfig.framesToRead) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const rgbaFrame =
        value.frame.type === VideoBufferType.RGBA
          ? value.frame
          : value.frame.convert(VideoBufferType.RGBA);

      if (
        rgbaFrame.width !== videoConfig.width ||
        rgbaFrame.height !== videoConfig.height
      ) {
        throw new Error(
          `Unexpected remote video dimensions ${rgbaFrame.width}x${rgbaFrame.height}.`
        );
      }

      checksums.push(
        rgbaFrame.data[0] +
          rgbaFrame.data[1] +
          rgbaFrame.data[2] +
          rgbaFrame.data[rgbaFrame.data.length - 1]
      );
      framesRead += 1;
    }
  } finally {
    await reader.cancel();
  }

  if (framesRead < videoConfig.framesToRead) {
    throw new Error(
      `Expected ${videoConfig.framesToRead} remote video frames, received ${framesRead}.`
    );
  }

  if (new Set(checksums).size < 2) {
    throw new Error("Remote video frames arrived, but their content did not vary.");
  }

  return {
    framesRead,
    checksums,
  };
}

async function main() {
  const publisherRoom = new Room();
  const subscriberRoom = new Room();

  let audioTrack;
  let videoTrack;

  try {
    const [publisherToken, subscriberToken] = await Promise.all([
      createJoinToken(publisherIdentity, "Nebula Publisher Bot"),
      createJoinToken(subscriberIdentity, "Nebula Subscriber Bot"),
    ]);

    await Promise.all([
      publisherRoom.connect(serverUrl, publisherToken, {
        autoSubscribe: true,
        dynacast: false,
      }),
      subscriberRoom.connect(serverUrl, subscriberToken, {
        autoSubscribe: true,
        dynacast: false,
      }),
    ]);

    const audioSubscribed = waitForTrackSubscribed(
      subscriberRoom,
      TrackKind.KIND_AUDIO
    );
    const videoSubscribed = waitForTrackSubscribed(
      subscriberRoom,
      TrackKind.KIND_VIDEO
    );

    const audioSource = new AudioSource(
      audioConfig.sampleRate,
      audioConfig.channels
    );
    const videoSource = new VideoSource(videoConfig.width, videoConfig.height);

    audioTrack = LocalAudioTrack.createAudioTrack("nebula-e2e-audio", audioSource);
    videoTrack = LocalVideoTrack.createVideoTrack("nebula-e2e-video", videoSource);

    const audioOptions = new TrackPublishOptions();
    audioOptions.source = TrackSource.SOURCE_MICROPHONE;

    const videoOptions = new TrackPublishOptions();
    videoOptions.source = TrackSource.SOURCE_CAMERA;

    await Promise.all([
      publisherRoom.localParticipant.publishTrack(audioTrack, audioOptions),
      publisherRoom.localParticipant.publishTrack(videoTrack, videoOptions),
    ]);

    const [{ track: remoteAudioTrack }, { track: remoteVideoTrack }] =
      await Promise.all([audioSubscribed, videoSubscribed]);

    const [audioResult, videoResult] = await withTimeout(
      Promise.all([
        Promise.all([readRemoteAudio(remoteAudioTrack), publishAudio(audioSource)]).then(
          ([result]) => result
        ),
        Promise.all([readRemoteVideo(remoteVideoTrack), publishVideo(videoSource)]).then(
          ([result]) => result
        ),
      ]),
      30_000,
      "LiveKit end-to-end media verification"
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          roomName,
          participants: {
            publisher: publisherIdentity,
            subscriber: subscriberIdentity,
          },
          audio: audioResult,
          video: videoResult,
        },
        null,
        2
      )
    );
  } finally {
    await Promise.allSettled([
      audioTrack?.close(),
      videoTrack?.close(),
      publisherRoom.isConnected ? publisherRoom.disconnect() : undefined,
      subscriberRoom.isConnected ? subscriberRoom.disconnect() : undefined,
    ]);
    await dispose();
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        roomName,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
