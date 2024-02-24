local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Spawn = require(script.Parent.Parent.spawn)

local Net = require(script.Parent.Parent.Net)

local BitBuffer = require(ReplicatedStorage.rbxts_include.node_modules["@rbxts"].bitbuffer.src.roblox)

export type Server<T...> = {
	Id: string,
	Validate: (...unknown) -> T...,

	Unreliable: boolean,
	serializer: any,

	Fire: (self: Server<T...>, Player: Player, T...) -> (),
	FireAll: (self: Server<T...>, T...) -> (),
	FireAllExcept: (self: Server<T...>, Except: Player, T...) -> (),
	FireList: (self: Server<T...>, List: { Player }, T...) -> (),
	FireWithFilter: (self: Server<T...>, Filter: (Player) -> boolean, T...) -> (),

	On: (self: Server<T...>, Callback: (Player, T...) -> ()) -> (),
}

local function Fire<T...>(self: Server<T...>, Player: Player, ...: T...)
	if self.Unreliable then
		Net.Server.SendUnreliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
	else
		Net.Server.SendReliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
	end
end

local function FireAll<T...>(self: Server<T...>, ...: T...)
	for _, Player in Players:GetPlayers() do
		if self.Unreliable then
			Net.Server.SendUnreliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
		else
			Net.Server.SendReliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
		end
	end
end

local function FireAllExcept<T...>(self: Server<T...>, Except: Player, ...: T...)
	for _, Player in Players:GetPlayers() do
		if Player ~= Except then
			if self.Unreliable then
				Net.Server.SendUnreliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
			else
				Net.Server.SendReliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
			end
		end
	end
end

local function FireList<T...>(self: Server<T...>, List: { Player }, ...: T...)
	for _, Player in List do
		if self.Unreliable then
			Net.Server.SendUnreliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
		else
			Net.Server.SendReliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
		end
	end
end

local function FireWithFilter<T...>(self: Server<T...>, Filter: (Player) -> boolean, ...: T...)
	for _, Player in Players:GetPlayers() do
		if Filter(Player) then
			if self.Unreliable then
				Net.Server.SendUnreliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
			else
				Net.Server.SendReliableEvent(Player, self.Id, table.pack(self.serializer.Ser(...).dumpString()))
			end
		end
	end
end

local function On<T...>(self: Server<T...>, Callback: (Player, T...) -> ())
	Net.Server.SetListener(self.Id, function(Player, Args)
		Spawn(function(self: typeof(self), Player: Player, ...: any)
			local deserialized = self.serializer.Des(BitBuffer(...))
			if pcall(self.Validate, deserialized) then
				Callback(Player, deserialized)
			end
		end, self, Player, table.unpack(Args))
	end)
end

local function Server<T...>(Id: string, serializer, Validate: (...unknown) -> T..., Unreliable: boolean): Server<T...>
	return {
		Id = Id,
		Validate = Validate,

		Unreliable = Unreliable,
		serializer = serializer,

		Fire = Fire,
		FireAll = FireAll,
		FireAllExcept = FireAllExcept,
		FireList = FireList,
		FireWithFilter = FireWithFilter,

		On = On,
	} :: any
end

return Server
