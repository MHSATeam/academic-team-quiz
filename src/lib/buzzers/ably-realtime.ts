import {
  BoxMessage,
  BoxPresence,
  PlayerMessage,
  PlayerPresence,
  TimingMessage,
} from "@/src/lib/buzzers/message-types";
import { Realtime, Types } from "ably";

type MessageCallback<Message> = (msg: Message) => void;

class AblyChannelWrapper<Message> {
  protected readonly channel: Types.RealtimeChannelPromise;
  constructor(channel: Types.RealtimeChannelPromise) {
    this.channel = channel;
  }

  public subscribe(callback: MessageCallback<Message>, event = "status") {
    const callbackWrapper = (msg: Types.Message) => {
      callback(msg.data as Message);
    };

    this.channel.subscribe(event, callbackWrapper);

    return () => {
      this.channel.unsubscribe(event, callbackWrapper);
    };
  }

  public unsubscribe(event = "all"): void {
    if (event === "all") {
      this.channel.unsubscribe();
      this.channel.detach();
    } else {
      this.channel.unsubscribe(event);
    }
  }

  public async publish(message: Message, event = "status"): Promise<void> {
    await this.channel.publish(event, message);
  }
}

export type PresenceSubscribeCallback<Presence> = (
  event: Omit<Types.PresenceMessage, "data"> & { data: Presence },
  type: "enter" | "leave" | "update" | "present",
) => void;

class PresenceChannel<Message, Presence> extends AblyChannelWrapper<Message> {
  private _isPresent = false;
  private _clientIdConnectionMap: Record<string, string> = {};
  private _presenceListeners: PresenceSubscribeCallback<Presence>[] = [];
  private _isSubscribed = false;

  public get isPresent() {
    return this._isPresent;
  }

  constructor(channel: Types.RealtimeChannelPromise) {
    super(channel);
  }

  public async enter(data: Presence) {
    await this.channel.presence.enter(data);
    this._isPresent = true;
  }

  public async update(data: Presence) {
    if (!this.isPresent) {
      await this.enter(data);
    } else {
      await this.channel.presence.update(data);
    }
  }

  public async leave() {
    await this.channel.presence.leave();
    this._isPresent = false;
  }

  public async getPresent() {
    return this.channel.presence.get({});
  }

  private onPresenceEvent(event: Types.PresenceMessage) {
    if (event.action !== "absent") {
      if (event.action !== "leave") {
        this._clientIdConnectionMap[event.clientId] = event.connectionId;
      } else {
        if (
          this._clientIdConnectionMap[event.clientId] !== event.connectionId
        ) {
          // Hide leave event from outdated connection
          return;
        } else {
          delete this._clientIdConnectionMap[event.clientId];
        }
      }
      for (const callback of this._presenceListeners) {
        callback({ ...event, data: event.data as Presence }, event.action);
      }
    }
  }

  private boundOnPresenceEvent = this.onPresenceEvent.bind(this);

  public subscribePresent(
    callback: PresenceSubscribeCallback<Presence>,
  ): () => void {
    this._presenceListeners.push(callback);
    if (!this._isSubscribed) {
      this.channel.presence.subscribe(this.boundOnPresenceEvent);
      this._isSubscribed = true;
    } else {
      this.channel.presence.get().then((messages) => {
        for (const message of messages) {
          if (message.action !== "absent") {
            callback(message, message.action);
          }
        }
      });
    }

    return () => {
      this._presenceListeners = this._presenceListeners.filter(
        (c) => c !== callback,
      );
      if (this._presenceListeners.length === 0 && this._isSubscribed) {
        this._isSubscribed = false;
        this.channel.presence.unsubscribe(this.boundOnPresenceEvent);
      }
    };
  }
}

export class AblyClient {
  protected static readonly CONNETION_TIMEOUT = 10000;
  protected static readonly CLIENT_ID_STORAGE_KEY = "ably-client";
  protected readonly client: Types.RealtimePromise;
  public stateManager: ConnectionStateManager = new ConnectionStateManager();

  constructor() {
    const realtimeOptions: Types.ClientOptions = {
      authUrl: "/api/ably-auth",
      autoConnect: false,
    };
    if (typeof window !== "undefined") {
      const key = window.localStorage.getItem(AblyClient.CLIENT_ID_STORAGE_KEY);
      if (key !== null) {
        realtimeOptions.authParams = {
          "client-id": key,
        };
      }
    }
    this.client = new Realtime.Promise(realtimeOptions);
    this.initializeConnectionListener();
  }

  public get clientId() {
    return this.client.auth.clientId;
  }

  private async initializeConnectionListener() {
    this.client.connection.on((stateChange) => {
      if (
        stateChange.current === "disconnected" &&
        stateChange.reason &&
        stateChange.reason.cause
      ) {
        const cause = stateChange.reason.cause;
        if (typeof cause === "object" && "statusCode" in cause) {
          if (cause.statusCode === 501) {
            this.disconnect();
          }
        }
      }
      if (stateChange.current === "connected") {
        const clientId = this.client.auth.clientId;
        if (clientId && clientId.length > 0) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              AblyClient.CLIENT_ID_STORAGE_KEY,
              clientId,
            );
          }
        }
      }
      this.stateManager._onNewState(stateChange);
    });
  }

  public async disconnect() {
    try {
      this.client.close();
    } catch (_) {
      return;
    }
  }

  public async connect(): Promise<Types.ConnectionState> {
    this.client.connect();
    return new Promise((resolve) => {
      const stateListener = (stateChange: Types.ConnectionStateChange) => {
        if (
          (
            [
              "connected",
              "disconnected",
              "failed",
              "closed",
              "suspended",
            ] as Types.ConnectionState[]
          ).includes(stateChange.current)
        ) {
          this.client.connection.off(stateListener);
          resolve(stateChange.current);
        }
      };
      setTimeout(() => {
        this.client.connection.off(stateListener);
        resolve("suspended");
      }, AblyClient.CONNETION_TIMEOUT);
      this.client.connection.on(stateListener);
    });
  }
}

export class BuzzerClient extends AblyClient {
  private _gameId: number | null = null;
  private _player: PresenceChannel<PlayerMessage, PlayerPresence> | null = null;
  private _box: PresenceChannel<BoxMessage, BoxPresence> | null = null;
  private _timing: AblyChannelWrapper<TimingMessage> | null = null;

  public hasJoinedGame() {
    return this.gameId !== null;
  }

  public get gameId() {
    return this._gameId;
  }

  public get player() {
    if (!this._player) {
      throw new Error("Client not connected to a game!");
    }
    return this._player;
  }

  public get box() {
    if (!this._box) {
      throw new Error("Client not connected to a game!");
    }
    return this._box;
  }

  public get timing() {
    if (!this._box) {
      throw new Error("Client not connected to a game!");
    }
    return this._timing;
  }

  public async doesGameExist(gameId: number): Promise<boolean> {
    const boxChannel = this.client.channels.get(`box:${gameId}`);
    const members = await boxChannel.presence.get();
    await boxChannel.detach();
    return members.length > 0;
  }

  public async connectToGame(gameId: number, requireCreated: boolean = true) {
    if (requireCreated && !(await this.doesGameExist(gameId))) {
      return false;
    }

    this._gameId = gameId;
    this._player = new PresenceChannel(
      this.client.channels.get(`player:${gameId}`),
    );
    this._box = new PresenceChannel(this.client.channels.get(`box:${gameId}`));
    this._timing = new AblyChannelWrapper(
      this.client.channels.get(`timing:${gameId}`),
    );
    return true;
  }
}

type StateChangeListener = (stateChange: Types.ConnectionStateChange) => void;
class ConnectionStateManager {
  public state: Types.ConnectionState = "initialized";
  public _stateChangeListeners: {
    state: Types.ConnectionState | "all";
    listener: StateChangeListener;
  }[] = [];

  public _onNewState(stateChange: Types.ConnectionStateChange) {
    this.state = stateChange.current;
    this._stateChangeListeners.forEach((value) => {
      if (value.state === stateChange.current || value.state === "all") {
        value.listener(stateChange);
      }
    });
  }

  public subscribe(callback: StateChangeListener): void;
  public subscribe(
    event: Types.ConnectionState,
    callback: StateChangeListener,
  ): void;
  public subscribe(
    event: Types.ConnectionState | StateChangeListener,
    callback?: StateChangeListener,
  ) {
    let innerEvent: Types.ConnectionState | "all";
    if (typeof event === "function") {
      callback = event;
      innerEvent = "all";
    } else {
      innerEvent = event;
    }
    if (callback === undefined) {
      throw new Error("Missing event callback!");
    }

    this._stateChangeListeners.push({
      state: innerEvent,
      listener: callback,
    });
  }

  public unsubscribe(): void;
  public unsubscribe(event: Types.ConnectionState): void;
  public unsubscribe(callback: StateChangeListener): void;
  public unsubscribe(
    event: Types.ConnectionState,
    callback: StateChangeListener,
  ): void;
  public unsubscribe(
    event?: Types.ConnectionState | StateChangeListener,
    callback?: StateChangeListener,
  ) {
    let innerEvent: Types.ConnectionState | "all" = "all";
    let innerCallback: StateChangeListener | undefined = undefined;
    if (callback !== undefined) {
      innerCallback = callback;
    } else if (event !== undefined) {
      if (typeof event === "function") {
        innerCallback = event;
      } else {
        innerEvent = event;
      }
    }

    this._stateChangeListeners = this._stateChangeListeners.filter((value) => {
      if (innerCallback !== undefined) {
        if (value.listener !== innerCallback) {
          return true;
        }
      }
      if (innerEvent !== "all") {
        if (value.state !== innerEvent) {
          return true;
        }
      }
      return false;
    });
  }
}

export const RealtimeClient = new BuzzerClient();
