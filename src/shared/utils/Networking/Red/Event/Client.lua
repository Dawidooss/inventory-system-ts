--!nocheck
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Spawn = require(script.Parent.Parent.spawn)

local Net = require(script.Parent.Parent.Net)

local BitBuffer = require(ReplicatedStorage.rbxts_include.node_modules["@rbxts"].bitbuffer.src.roblox)

export type Client<T...> = {
	Id: string,

	Unreliable: boolean,

	Fire: (self: Client<T...>, T...) -> (),
	On: (self: Client<T...>, Callback: (T...) -> ()) -> (),
}

local function Fire<T...>(self: Client<T...>, ...: T...)
	if self.Unreliable then
		Net.Client.SendUnreliableEvent(self.Id, table.pack(self.serializer.Ser(...).dumpString()))
	else
		Net.Client.SendReliableEvent(self.Id, table.pack(self.serializer.Ser(...).dumpString()))
	end
end

local function On<T...>(self: Client<T...>, Callback: (T...) -> ())
	Net.Client.SetListener(self.Id, function(Args)
		Spawn(Callback, self.serializer.Des(BitBuffer(table.unpack(Args))))
	end)
end

local function Client<T...>(Id: string, serializer, Unreliable: boolean): Client<T...>
	return {
		Id = Id,

		Unreliable = Unreliable,
		serializer = serializer,

		Fire = Fire,
		On = On,
	} :: any
end

return Client
