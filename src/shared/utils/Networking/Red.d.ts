import { Sedes } from "./Sedes";

export interface ServerEvent<T> {
	Fire(player: Player, data: T): void;
	FireAll(data: T): void;
	FireAllExcept(player: Player, data: T): void;
	FireList(players: Player[], data: T): void;
	FireWithFilter(filter: (player: Player) => boolean, data: T): void;
	On(callback: (player: Player, data: T) => void): void;
}

export interface ClientEvent<T> {
	Fire(data: T): void;
	On(callback: (data: T) => void): void;
}

export interface Future<R> {
	After(callback: (success: boolean, data: R) => void): void;
	// Await(): [boolean, R];
}

export interface RedFunction<T extends { [key: string]: any }, R extends { [key: string]: any }> {
	SetCallback(callback: (player: Player, data: T) => R): void;
	Call(data: T): Future<R>;
	serializerIn: Sedes.Serializer<T>;
	serializerOut: Sedes.Serializer<R>;
}

export interface ServerOrClient<T extends { [key: string]: any }> {
	Server(): ServerEvent<T>;
	Client(): ClientEvent<T>;
	serializer: Sedes.Serializer<T>;
}

declare namespace Red {
	function Event<T extends { [key: string]: any }>(name: string, serializers: Sedes.Serializer<T>): ServerOrClient<T>;
	function Function<T extends { [key: string]: any }, R extends { [key: string]: any }>(
		name: string,
		serializerIn: Sedes.Serializer<T>,
		serializerOut: Sedes.Serializer<R>,
	): RedFunction<T, R>;
	// function SharedEvent(name: string): RedEvent;
	// function SharedSignalEvent(name: string): RedEvent;
}

export default Red;
