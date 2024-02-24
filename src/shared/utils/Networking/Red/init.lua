local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local function CreateEvents()
	if not ReplicatedStorage:FindFirstChild("ReliableRedEvent") then
		local ReliableRemote = Instance.new("RemoteEvent")
		ReliableRemote.Name = "ReliableRedEvent"
		ReliableRemote.Parent = ReplicatedStorage
	end

	if not ReplicatedStorage:FindFirstChild("UnreliableRedEvent") then
		local UnreliableRemote = Instance.new("UnreliableRemoteEvent")
		UnreliableRemote.Name = "UnreliableRedEvent"
		UnreliableRemote.Parent = ReplicatedStorage
	end
end

if RunService:IsServer() then
	CreateEvents()

	require(script.Net).Server.Start()
else
	if not game:GetService("RunService"):IsRunning() then
		CreateEvents()
	end
	ReplicatedStorage:WaitForChild("ReliableRedEvent")
	ReplicatedStorage:WaitForChild("UnreliableRedEvent")

	require(script.Net).Client.Start()
end

local SharedEvents = require(script.SharedEvent)

return {
	default = {
		Event = require(script.Event),
		Function = require(script.Function),
		SharedEvent = SharedEvents.SharedCallEvent,
		SharedSignalEvent = SharedEvents.SharedSignalEvent,
	},
}
