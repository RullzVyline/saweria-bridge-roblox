-- contoh ambil top 10 donatur pake http service
local HttpService = game:GetService("HttpService")

-- ganti pake url lu
local WORKER_URL = "https://saweria-bridge-ts.YOURUSERNAME.workers.dev"

-- function buat narik leaderboard
local function getTopDonators(limit)
	limit = limit or 10
	local url = WORKER_URL .. "/leaderboard?limit=" .. limit
	
	local success, response = pcall(function()
		return HttpService:GetAsync(url)
	end)
	
	if not success then
		warn("[SaweriaLeaderboard] Gagal narik data:", response)
		return nil
	end
	
	local successParse, decoded = pcall(function()
		return HttpService:JSONDecode(response)
	end)
	
	if not successParse or not decoded.success then
		warn("[SaweriaLeaderboard] Gagal parse json atau response error:", decoded and decoded.message)
		return nil
	end
	
	return decoded.data
end

-- contoh pemakaian: jalanin tiap 60 detik biar irit request
task.spawn(function()
	while true do
		print("[SaweriaLeaderboard] Narik data terbaru...")
		
		local leaderboard = getTopDonators(5) -- ambil top 5 aja
		
		if leaderboard then
			print("--- TOP 5 SULTAN SAWERIA ---")
			for _, entry in ipairs(leaderboard) do
				print(string.format("#%d - %s: Rp %d (%d kali nyawer)", 
					entry.rank, 
					entry.donator_name, 
					entry.total_amount,
					entry.donation_count
				))
			end
			print("----------------------------")
			
			-- TODO: update UI SurfaceGui lu pake data variabel `leaderboard` 
			-- struktur datanya: { rank=1, donator_name="Orang", total_amount=50000, donation_count=2 }
		end
		
		task.wait(60) -- cooldown 1 menit (JANGAN DI-SPAM BIAR GA KENA RATE LIMIT CLOUDFLARE)
	end
end)
