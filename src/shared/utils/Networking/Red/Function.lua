local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Future = require(script.Parent.future)
local Spawn = require(script.Parent.spawn)

local Net = require(script.Parent.Net)
local Identifier = require(script.Parent.Identifier)

local BitBuffer = require(ReplicatedStorage.rbxts_include.node_modules["@rbxts"].bitbuffer.src.roblox)

export type Function<A..., R...> = {
	Id: string,
	Validate: (...unknown) -> A...,
	serializerIn: any,
	serializerOut: any,

	SetCallback: (self: Function<A..., R...>, Callback: (Player, A...) -> R...) -> (),
	Call: (
		self: Function<A..., R...>,
		A...
	) -> typeof(Future.new(function(): (boolean, R...)
		return {} :: any
	end)),
}

local function SetCallback<A..., R...>(self: Function<A..., R...>, Callback: (Player, A...) -> R...)
	assert(RunService:IsServer(), "Cannot set callback to function on client")

	Net.Server.SetListener(self.Id, function(Player, Args)
		local CallId = table.remove(Args, 1)

		if type(CallId) ~= "string" then
			return
		end

		Spawn(function(Player: Player, CallId: string, ...: any)
			if pcall(self.Validate, ...) then
				local succ, res = pcall(Callback, Player, self.serializerIn.Des(BitBuffer(...)))
				if res then
					res = self.serializerOut.Ser(res).dumpString()
				end
				Net.Server.SendCallReturn(Player, CallId, table.pack(succ, res))
			end
		end, Player, CallId, unpack(Args))
	end)
end

local function Call<A..., R...>(self: Function<A..., R...>, ...: A...)
	return Future.new(function(...: any)
		local CallId = Identifier.Unique()

		local succ, res =
			table.unpack(Net.Client.CallAsync(self.Id, table.pack(CallId, self.serializerIn.Ser(...).dumpString())))
		if res then
			res = self.serializerOut.Des(BitBuffer(res))
		end
		return succ, res
	end, ...)
end

local function NoValidation(...)
	return ...
end

local function Function<A..., R...>(Name: string, serializerIn, serializerOut): Function<A..., R...>
	assert(not Identifier.Exists(Name), "Cannot use same name twice")

	return {
		Id = Identifier.Shared(Name):Await(),
		Validate = NoValidation,
		serializerIn = serializerIn,
		serializerOut = serializerOut,

		SetCallback = SetCallback,
		Call = Call,
	} :: any
end

return Function
