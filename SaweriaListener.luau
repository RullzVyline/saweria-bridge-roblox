--[[
  pendengar donasi saweria
  taro di ServerScriptService

  format pesan: "DONASI|nama|nominal|pesan"
  karakter | di-escape jadi \| dari backend
]]

local MessagingService = game:GetService("MessagingService")

local TOPIC = "SaweriaDonasi"
local MAX_RETRIES = 5
local BASE_DELAY = 2

-- unescape \| balik jadi | (kebalikan dari yg di backend)
local function safeSplit(str: string): { string }
	local parts: { string } = {}
	local current = ""
	local i = 1

	while i <= #str do
		if string.sub(str, i, i) == "\\" and string.sub(str, i + 1, i + 1) == "|" then
			current ..= "|"
			i += 2
		elseif string.sub(str, i, i) == "|" then
			table.insert(parts, current)
			current = ""
			i += 1
		else
			current ..= string.sub(str, i, i)
			i += 1
		end
	end

	table.insert(parts, current)
	return parts
end

local function onDonationReceived(msg: { Data: string, Sent: number })
	local str = msg.Data

	if typeof(str) ~= "string" or #str == 0 then
		warn("[SaweriaBridge] pesan kosong, skip")
		return
	end

	local parts = safeSplit(str)

	if parts[1] ~= "DONASI" then
		warn("[SaweriaBridge] format aneh: " .. tostring(parts[1]))
		return
	end

	local nama = parts[2]
	local nominalStr = parts[3]
	local pesan = parts[4]

	if not nama or not nominalStr then
		warn("[SaweriaBridge] field kurang, skip")
		return
	end

	local nominal = tonumber(nominalStr)
	if not nominal then
		warn("[SaweriaBridge] nominal bukan angka: " .. tostring(nominalStr))
		return
	end

	pesan = pesan or ""

	print("═══════════════════════════════════════════")
	print("🤑 ADA YG NYAWER!")
	print("  Dari   : " .. nama)
	print("  Total  : Rp " .. tostring(nominal))
	print("  Pesan  : " .. pesan)
	print("═══════════════════════════════════════════")

	-- mau nampilin ke player? pake fireallclients
	-- contoh:
	-- game.ReplicatedStorage.ShowDonationUI:FireAllClients(nama, nominal, pesan)
end

-- subscribe + auto reconnect kalo gagal
local function subscribe()
	local attempt = 0

	while attempt < MAX_RETRIES do
		local ok, err = pcall(function()
			MessagingService:SubscribeAsync(TOPIC, onDonationReceived)
		end)

		if ok then
			print("[SaweriaBridge] ✅ nyala, dengerin topic: " .. TOPIC)
			return true
		end

		attempt += 1
		local delay = BASE_DELAY * (2 ^ (attempt - 1))
		warn(string.format(
			"[SaweriaBridge] ❌ gagal subscribe (%d/%d): %s — coba lagi %ds...",
			attempt, MAX_RETRIES, tostring(err), delay
		))
		task.wait(delay)
	end

	warn("[SaweriaBridge] ⛔ nyerah, semua retry gagal. listener MATI!")
	return false
end

print("[SaweriaBridge] mulai...")
subscribe()
