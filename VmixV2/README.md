# vMix Logger

Automatically logs every input played in vMix — with timestamps, input details, and screenshots. Includes a web dashboard and CSV/PDF export.

## Requirements

- Node.js 16+
- vMix running on Windows with Web Controller enabled

## Setup

### 1. Enable vMix Web Controller

In vMix: **Settings → Web Controller → Enable**
- HTTP API runs on port `8088`
- TCP API runs on port `8099`

### 2. Configure

Edit `.env` to match your setup:

```
VMIX_HOST=localhost       # or IP of vMix PC e.g. 192.168.1.50
VMIX_PORT=8088
VMIX_TCP_PORT=8099
POLL_INTERVAL_MS=3000     # HTTP poll every 3 seconds
PORT=3000                 # Dashboard web port
```

If running this Node app on a **different machine** than vMix, set `VMIX_HOST` to the IP of the vMix PC. Make sure Windows Firewall allows ports 8088 and 8099.

### 3. Install & Run

```bash
npm install
node index.js
```

### 4. Open Dashboard

Visit: **http://localhost:3000**

---

## What Gets Logged

| Field | Description |
|-------|-------------|
| Played At | Exact timestamp when input went live |
| Input Number | vMix input slot number |
| Input Name | Name/title of the input |
| Input Type | Video, Camera, Image, Audio, etc. |
| Duration | Total duration of the clip |
| Position | Playhead position at time of going live |
| Loop | Whether the input was set to loop |
| Source | `tcp` (real-time) or `http-poll` (fallback) |
| Screenshot | PNG snapshot of the input at go-live time |

---

## How Detection Works

**TCP (primary):** Subscribes to vMix's real-time TALLY events over TCP port 8099. Detects input transitions instantly.

**HTTP Polling (fallback/double-check):** Polls `/api` every 3 seconds and detects active input changes. Acts as a fallback if TCP disconnects.

---

## Exports

- **CSV** — Download all logs as a spreadsheet
- **PDF** — Download formatted A4 landscape report

Screenshots are saved to the `screenshots/` folder.

---

## File Structure

```
vmix-logger/
├── index.js           # App entry point
├── .env               # Configuration
├── vmix-log.db        # SQLite database (auto-created)
├── screenshots/       # Input screenshots (auto-created)
├── exports/           # CSV/PDF exports (auto-created)
├── public/
│   └── index.html     # Web dashboard
└── src/
    ├── db.js          # Database layer
    ├── vmix-http.js   # HTTP polling & screenshots
    ├── vmix-tcp.js    # TCP real-time connection
    ├── export.js      # CSV & PDF export
    └── server.js      # Express API routes
```
