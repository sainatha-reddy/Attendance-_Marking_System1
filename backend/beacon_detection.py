from bleak import BleakScanner
import asyncio
import math
import time

# === Configuration ===
TARGET_ADDRESS = "B0:D2:78:48:3E:5A"
MEASURED_POWER = -73  # RSSI at 1 meter
N = 3.2               # Path loss exponent
ALPHA = 0.6           # EMA smoothing
TIMEOUT_SECONDS = 5   # Time before saying "not detected"

# === State Variables ===
smoothed_rssi = None
last_seen_time = 0
already_reported_lost = False

# === Utility Function ===
def estimate_distance(rssi):
    return 10 ** ((MEASURED_POWER - rssi) / (10 * N))

def print_device_info(name, address, rssi, smoothed_rssi, distance):
    print(f"Device: {name or 'Unknown'} ({address})")
    print(f"Raw RSSI: {rssi} dBm")
    print(f"Smoothed RSSI: {smoothed_rssi:.2f} dBm")
    print(f"Estimated Distance: {distance:.2f} meters\n")

# === BLE Callback Function ===
def detection_callback(device, advertisement_data):
    global smoothed_rssi, last_seen_time, already_reported_lost

    if device.address == TARGET_ADDRESS:
        current_rssi = advertisement_data.rssi
        last_seen_time = time.time()
        already_reported_lost = False  # reset

        if smoothed_rssi is None:
            smoothed_rssi = current_rssi
        else:
            smoothed_rssi = ALPHA * current_rssi + (1 - ALPHA) * smoothed_rssi

        distance = estimate_distance(smoothed_rssi)

        print_device_info(device.name, device.address, current_rssi, smoothed_rssi, distance)

# === Main Async Tracker ===
async def track_distance():
    global last_seen_time, already_reported_lost

    print("Starting BLE scan...\n")
    scanner = BleakScanner(detection_callback)
    await scanner.start()
    last_seen_time = time.time()

    try:
        while True:
            now = time.time()
            elapsed = now - last_seen_time

            if elapsed > TIMEOUT_SECONDS and not already_reported_lost:
                print("Device not detected for 5 seconds.\n")

                already_reported_lost = True

            await asyncio.sleep(1)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await scanner.stop()

# === Run the Scanner ===
if __name__ == "__main__":
    asyncio.run(track_distance())
