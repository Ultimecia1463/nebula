"use client";

import {
  isTrackReference,
  LiveKitRoom,
  RoomAudioRenderer,
  TrackToggle,
  type TrackReferenceOrPlaceholder,
  useConnectionState,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import {
  ConnectionState,
  Track,
  type Participant,
} from "livekit-client";
import {
  LoaderCircle,
  LogOut,
  Mic,
  MicOff,
  Signal,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type {
  LiveKitConnectionDetails,
  LiveKitParticipantMetadata,
} from "@/types/livekit";

interface MediaRoomProps {
  channelId: string;
  channelName: string;
}

interface LocalMediaAvailability {
  checked: boolean;
  canPublish: boolean;
  message: string | null;
}

const sortTrackReferences = (tracks: TrackReferenceOrPlaceholder[]) =>
  [...tracks].sort((left, right) => {
    if (left.participant.isLocal === right.participant.isLocal) {
      return (left.participant.name || left.participant.identity).localeCompare(
        right.participant.name || right.participant.identity
      );
    }

    return left.participant.isLocal ? -1 : 1;
  });

const parseParticipantMetadata = (
  metadata: string | undefined
): LiveKitParticipantMetadata | null => {
  if (!metadata) {
    return null;
  }

  try {
    return JSON.parse(metadata) as LiveKitParticipantMetadata;
  } catch {
    return null;
  }
};

const getParticipantImage = (participant: Participant) =>
  parseParticipantMetadata(participant.metadata)?.imageUrl ?? null;

const getParticipantName = (participant: Participant) =>
  participant.name || participant.identity || "Guest";

const getConnectionLabel = (connectionState: ConnectionState) => {
  switch (connectionState) {
    case ConnectionState.Connected:
      return "Connected to SFU";
    case ConnectionState.Reconnecting:
      return "Reconnecting to SFU";
    case ConnectionState.Connecting:
      return "Joining SFU room";
    default:
      return "Disconnected";
  }
};

const getLocalMediaAvailability = (): LocalMediaAvailability => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      checked: false,
      canPublish: false,
      message: null,
    };
  }

  const canUseGetUserMedia =
    typeof navigator.mediaDevices?.getUserMedia === "function";

  if (window.isSecureContext && canUseGetUserMedia) {
    return {
      checked: true,
      canPublish: true,
      message: null,
    };
  }

  if (!window.isSecureContext) {
    return {
      checked: true,
      canPublish: false,
      message: `Camera and microphone publishing requires HTTPS or http://localhost. ${window.location.origin} is not a secure context, so you can join this room only as a viewer/listener from this address.`,
    };
  }

  return {
    checked: true,
    canPublish: false,
    message:
      "This browser context does not expose MediaDevices.getUserMedia, so camera and microphone publishing are unavailable.",
  };
};

const getVideoGridClasses = (participantCount: number) =>
  cn(
    "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-flow-dense xl:grid-cols-12",
    participantCount <= 1
      ? "xl:auto-rows-[minmax(132px,1fr)]"
      : "xl:auto-rows-[minmax(108px,1fr)] 2xl:auto-rows-[minmax(128px,1fr)]"
  );

const getVideoTilePattern = (participantCount: number) => {
  switch (participantCount) {
    case 1:
      return ["min-h-[68vh] md:col-span-2 xl:col-span-12 xl:row-span-5"];
    case 2:
      return [
        "min-h-[360px] md:col-span-2 xl:col-span-8 xl:row-span-4 xl:min-h-[520px]",
        "min-h-[360px] xl:col-span-4 xl:row-span-4 xl:min-h-[520px]",
      ];
    case 3:
      return [
        "min-h-[420px] md:col-span-2 xl:col-span-7 xl:row-span-4 xl:min-h-[560px]",
        "min-h-[260px] xl:col-span-5 xl:row-span-2",
        "min-h-[260px] xl:col-span-5 xl:row-span-2",
      ];
    case 4:
      return [
        "min-h-[420px] md:col-span-2 xl:col-span-7 xl:row-span-4 xl:min-h-[560px]",
        "min-h-[260px] xl:col-span-5 xl:row-span-2",
        "min-h-[240px] xl:col-span-3 xl:row-span-2",
        "min-h-[240px] xl:col-span-2 xl:row-span-2",
      ];
    case 5:
      return [
        "min-h-[420px] md:col-span-2 xl:col-span-6 xl:row-span-4 xl:min-h-[560px]",
        "min-h-[280px] xl:col-span-3 xl:row-span-2",
        "min-h-[280px] xl:col-span-3 xl:row-span-2",
        "min-h-[240px] xl:col-span-4 xl:row-span-2",
        "min-h-[240px] xl:col-span-2 xl:row-span-2",
      ];
    case 6:
      return [
        "min-h-[420px] md:col-span-2 xl:col-span-6 xl:row-span-4 xl:min-h-[560px]",
        "min-h-[280px] xl:col-span-3 xl:row-span-2",
        "min-h-[280px] xl:col-span-3 xl:row-span-2",
        "min-h-[220px] xl:col-span-2 xl:row-span-2",
        "min-h-[220px] xl:col-span-2 xl:row-span-2",
        "min-h-[220px] xl:col-span-2 xl:row-span-2",
      ];
    default:
      return [];
  }
};

const getVideoTileClasses = (index: number, participantCount: number) => {
  const pattern = getVideoTilePattern(participantCount);

  if (pattern[index]) {
    return pattern[index];
  }

  if (index === 0) {
    return "min-h-[420px] md:col-span-2 xl:col-span-6 xl:row-span-4 xl:min-h-[560px]";
  }

  switch ((index - 1) % 4) {
    case 0:
      return "min-h-[260px] xl:col-span-3 xl:row-span-2";
    case 1:
      return "min-h-[260px] xl:col-span-3 xl:row-span-2";
    case 2:
      return "min-h-[220px] xl:col-span-2 xl:row-span-2";
    default:
      return "min-h-[240px] xl:col-span-4 xl:row-span-2";
  }
};

const ParticipantChrome = ({
  participant,
  children,
  isVideoRoom,
  isFeatured = false,
  className,
}: {
  participant: Participant;
  children: React.ReactNode;
  isVideoRoom: boolean;
  isFeatured?: boolean;
  className?: string;
}) => {
  const imageUrl = getParticipantImage(participant);
  const name = getParticipantName(participant);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-white/10 bg-[#111822] shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        isFeatured ? "rounded-[32px]" : "rounded-[28px]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(244,114,182,0.08),_transparent_30%)]" />
      {children}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 via-black/35 to-transparent",
          isFeatured ? "px-5 py-5" : "px-4 py-4"
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate font-semibold text-white",
                isFeatured ? "text-base" : "text-sm"
              )}
            >
              {name}
            </p>
            {participant.isLocal && (
              <Badge className="border-emerald-400/30 bg-emerald-500/15 text-emerald-100">
                You
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-300">
            {participant.isLocal ? "Publishing to SFU" : "Subscribed from SFU"}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-slate-100 backdrop-blur">
          {participant.isMicrophoneEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4 text-rose-300" />
          )}
          {isVideoRoom &&
            (participant.isCameraEnabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4 text-amber-300" />
            ))}
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-sky-300/15 bg-slate-950/45 px-3 py-1 text-[11px] font-medium text-sky-50 backdrop-blur">
        {participant.identity}
      </div>

      {!participant.isCameraEnabled && isVideoRoom && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur">
            <UserAvatar
              src={imageUrl ?? undefined}
              alt={name}
              className="h-20 w-20"
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{name}</p>
            <p className="text-sm text-slate-300">Camera is off</p>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoGrid = () => {
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const orderedTracks = useMemo(
    () => sortTrackReferences(cameraTracks),
    [cameraTracks]
  );

  return (
    <div className={getVideoGridClasses(orderedTracks.length)}>
      {orderedTracks.map((trackRef, index) => {
        const participant = trackRef.participant;
        const hasVideoTrack = isTrackReference(trackRef);
        const isFeatured = orderedTracks.length === 1 || index === 0;

        return (
          <ParticipantChrome
            key={`${participant.identity}:${trackRef.source}`}
            participant={participant}
            isVideoRoom
            isFeatured={isFeatured}
            className={getVideoTileClasses(index, orderedTracks.length)}
          >
            {hasVideoTrack && participant.isCameraEnabled ? (
              <VideoTrack
                trackRef={trackRef}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_rgba(15,23,42,0.96)_58%),linear-gradient(135deg,rgba(148,163,184,0.12),transparent_46%)]" />
            )}
          </ParticipantChrome>
        );
      })}
    </div>
  );
};

type LeaveRoomButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  stopTracks?: boolean;
};

const LeaveRoomButton = ({
  className,
  children,
  onClick,
  disabled,
  stopTracks = true,
  ...props
}: LeaveRoomButtonProps) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const isDisconnected = connectionState === ConnectionState.Disconnected;

  return (
    <button
      {...props}
      type="button"
      className={className}
      disabled={disabled || isDisconnected}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || disabled || isDisconnected) {
          return;
        }

        room.disconnect(stopTracks);
      }}
    >
      {children}
    </button>
  );
};

const RoomShell = ({
  channelName,
  canPublishMedia,
  mediaSupportMessage,
}: {
  channelName: string;
  canPublishMedia: boolean;
  mediaSupportMessage: string | null;
}) => {
  const participants = useParticipants();
  const connectionState = useConnectionState();
  const { isMicrophoneEnabled, isCameraEnabled, lastCameraError, lastMicrophoneError } =
    useLocalParticipant();

  const mediaError = lastCameraError?.message || lastMicrophoneError?.message || null;
  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#0b1220_0%,#111827_45%,#0f172a_100%)] text-white">
      <RoomAudioRenderer />

      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-sky-400/25 bg-sky-500/15 text-sky-100">
                Video room
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-slate-100">
                <Users className="h-3.5 w-3.5" />
                {participants.length} participant{participants.length === 1 ? "" : "s"}
              </Badge>
              <Badge
                className={cn(
                  "border-white/10 text-slate-100",
                  isConnected ? "bg-emerald-500/15" : "bg-amber-500/15"
                )}
              >
                <Signal className="h-3.5 w-3.5" />
                {getConnectionLabel(connectionState)}
              </Badge>
            </div>

            <div>
              <p className="text-lg font-semibold text-white">{channelName}</p>
              <p className="text-sm text-slate-300">
                Media is published once to the SFU and forwarded to other participants.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TrackToggle
              source={Track.Source.Microphone}
              showIcon={false}
              disabled={!canPublishMedia}
              title={
                canPublishMedia
                  ? "Toggle microphone"
                  : "Microphone publishing requires HTTPS or localhost"
              }
              className={cn(
                buttonVariants({
                  variant: isMicrophoneEnabled ? "secondary" : "destructive",
                }),
                "rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {isMicrophoneEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
              {canPublishMedia
                ? isMicrophoneEnabled
                  ? "Mute"
                  : "Unmute"
                : "Mic unavailable"}
            </TrackToggle>

            <TrackToggle
              source={Track.Source.Camera}
              showIcon={false}
              disabled={!canPublishMedia}
              title={
                canPublishMedia
                  ? "Toggle camera"
                  : "Camera publishing requires HTTPS or localhost"
              }
              className={cn(
                buttonVariants({
                  variant: isCameraEnabled ? "secondary" : "destructive",
                }),
                "rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {isCameraEnabled ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
              {canPublishMedia
                ? isCameraEnabled
                  ? "Camera on"
                  : "Camera off"
                : "Camera unavailable"}
            </TrackToggle>

            <LeaveRoomButton
              stopTracks
              className={cn(
                buttonVariants({ variant: "destructive" }),
                "rounded-full"
              )}
            >
              <LogOut className="h-4 w-4" />
              Leave
            </LeaveRoomButton>
          </div>
        </div>

        {mediaError && (
          <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
            {mediaError}
          </div>
        )}

        {mediaSupportMessage && (
          <div className="mt-3 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-50">
            {mediaSupportMessage}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <VideoGrid />

        {participants.length === 1 && (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-center text-slate-300">
            <LoaderCircle className="mx-auto mb-3 h-5 w-5 animate-spin text-sky-200" />
            Waiting for someone else to join this video room.
          </div>
        )}
      </div>
    </div>
  );
};

export const MediaRoom = ({
  channelId,
  channelName,
}: MediaRoomProps) => {
  const [connectionDetails, setConnectionDetails] =
    useState<LiveKitConnectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [localMediaAvailability, setLocalMediaAvailability] =
    useState<LocalMediaAvailability>({
      checked: false,
      canPublish: false,
      message: null,
    });

  useEffect(() => {
    setLocalMediaAvailability(getLocalMediaAvailability());
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadConnectionDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ channelId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Unable to connect to the SFU room");
        }

        const details = (await response.json()) as LiveKitConnectionDetails;
        setConnectionDetails(details);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Failed to fetch LiveKit room token:", loadError);
        setConnectionDetails(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to connect to the SFU room"
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadConnectionDetails();

    return () => controller.abort();
  }, [channelId, retryKey]);

  if (isLoading || !localMediaAvailability.checked) {
    return (
      <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#0b1220_0%,#111827_45%,#0f172a_100%)] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <LoaderCircle className="mx-auto mb-3 h-6 w-6 animate-spin text-sky-200" />
          <p className="font-medium text-white">Connecting to the SFU room...</p>
          <p className="mt-1 text-sm text-slate-300">
            Requesting a room token and preparing media transport.
          </p>
        </div>
      </div>
    );
  }

  if (!connectionDetails || error) {
    return (
      <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#0b1220_0%,#111827_45%,#0f172a_100%)] px-4 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-rose-300/15 bg-rose-500/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <p className="text-lg font-semibold">Unable to join the media room</p>
          <p className="mt-2 text-sm text-rose-50/90">
            {error || "The SFU connection details could not be loaded."}
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="destructive" onClick={() => setRetryKey((value) => value + 1)}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={connectionDetails.token}
      serverUrl={connectionDetails.serverUrl}
      connect
      audio={localMediaAvailability.canPublish}
      video={localMediaAvailability.canPublish}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
      onError={(roomError) => {
        console.error("LiveKit room error:", roomError);
      }}
      className="h-full"
    >
      <RoomShell
        channelName={channelName}
        canPublishMedia={localMediaAvailability.canPublish}
        mediaSupportMessage={localMediaAvailability.message}
      />
    </LiveKitRoom>
  );
};
