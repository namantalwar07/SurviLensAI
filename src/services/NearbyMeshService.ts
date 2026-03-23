/**
 * Offline "mesh" layer — demo + extension point for BLE / Wi‑Fi Direct.
 *
 * Hackathon path: swap `scan()` / `broadcast()` with react-native-ble-plx or
 * react-native-wifi-reborn once native modules are linked.
 */


// import { BleManager, Device, State, BleError } from 'react-native-ble-plx';
// import { PermissionsAndroid, Platform } from 'react-native';
// import { Buffer } from 'buffer';

// export type MeshPeer = {
//   id: string;
//   label: string;
//   rssi?: number;
//   lastSeen: number;
// };

// export type MeshMessage = {
//   id: string;
//   from: string;
//   body: string;
//   ts: number;
// };

// // ── Change these UUIDs to anything unique for your app ──────────────────────
// const MESH_SERVICE_UUID        = '12345678-1234-1234-1234-123456789abc';
// const MESH_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

// const manager = new BleManager();
// let messages: MeshMessage[] = [];
// let knownPeers: Map<string, MeshPeer> = new Map();

// // ── Permissions ──────────────────────────────────────────────────────────────

// async function requestPermissions(): Promise<boolean> {
//   if (Platform.OS !== 'android') return true;
//   const api = parseInt(Platform.Version as string, 10);

//   if (api >= 31) {
//     const result = await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//       PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//       PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//     ]);
//     return Object.values(result).every(
//       v => v === PermissionsAndroid.RESULTS.GRANTED
//     );
//   } else {
//     const result = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//     );
//     return result === PermissionsAndroid.RESULTS.GRANTED;
//   }
// }

// // ── Wait for BLE radio ───────────────────────────────────────────────────────

// function waitForBluetooth(): Promise<void> {
//   return new Promise(resolve => {
//     const sub = manager.onStateChange(state => {
//       if (state === State.PoweredOn) {
//         sub.remove();
//         resolve();
//       }
//     }, true);
//   });
// }

// // ── Main service ─────────────────────────────────────────────────────────────

// export const NearbyMeshService = {

//   async scan(): Promise<MeshPeer[]> {
//     const granted = await requestPermissions();
//     if (!granted) {
//       console.warn('[BLE] Permissions denied');
//       return [];
//     }

//     await waitForBluetooth();
//     knownPeers.clear();

//     return new Promise(resolve => {
//       // Stop scan after 8 seconds and return what we found
//       const timeout = setTimeout(() => {
//         manager.stopDeviceScan();
//         resolve(Array.from(knownPeers.values()));
//       }, 8000);

//       manager.startDeviceScan(
//         null,           // null = scan ALL devices, change to [MESH_SERVICE_UUID] once you advertise
//         { allowDuplicates: false },
//         (error: BleError | null, device: Device | null) => {
//           if (error) {
//             console.error('[BLE] Scan error:', error.message);
//             clearTimeout(timeout);
//             manager.stopDeviceScan();
//             resolve(Array.from(knownPeers.values()));
//             return;
//           }
//           if (device) {
//             const peer: MeshPeer = {
//               id: device.id,
//               label: device.name || `Device (${device.id.slice(-5)})`,
//               rssi: device.rssi ?? undefined,
//               lastSeen: Date.now(),
//             };
//             knownPeers.set(device.id, peer);
//           }
//         }
//       );
//     });
//   },

//   getMessages(): MeshMessage[] {
//     return [...messages];
//   },

//   async broadcast(handle: string, text: string): Promise<void> {
//     // Save message locally (you sent it)
//     const msg: MeshMessage = {
//       id: `m-${Date.now()}`,
//       from: handle || 'You',
//       body: text,
//       ts: Date.now(),
//     };
//     messages = [msg, ...messages].slice(0, 50);

//     // Try to send to all known peers over BLE GATT
//     const peers = Array.from(knownPeers.values());
//     if (peers.length === 0) {
//       console.log('[BLE] No peers to send to');
//       return;
//     }

//     const payload = Buffer.from(
//       JSON.stringify({ from: handle, body: text })
//     ).toString('base64');

//     for (const peer of peers) {
//       try {
//         const device = await manager.connectToDevice(peer.id);
//         await device.discoverAllServicesAndCharacteristics();
//         await device.writeCharacteristicWithResponseForService(
//           MESH_SERVICE_UUID,
//           MESH_CHARACTERISTIC_UUID,
//           payload
//         );
//         await device.cancelConnection();
//         console.log(`[BLE] Sent to ${peer.label}`);
//       } catch (err: any) {
//         console.warn(`[BLE] Failed to send to ${peer.label}:`, err.message);
//       }
//     }
//   },

//   clearDemoMessages() {
//     messages = [];
//   },

//   destroy() {
//     manager.stopDeviceScan();
//     manager.destroy();
//   },
// };

import { BleManager, Device, State, BleError } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { Buffer } from 'buffer';

export type MeshPeer = {
  id: string;
  label: string;
  rssi?: number;
  lastSeen: number;
};

export type MeshMessage = {
  id: string;
  from: string;
  body: string;
  ts: number;
};

const MESH_SERVICE_UUID        = '12345678-1234-1234-1234-123456789abc';
const MESH_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

// ── Demo fallback data ───────────────────────────────────────────────────────
const DEMO_PEERS: MeshPeer[] = [
  { id: 'demo-1', label: 'SurviLens-Alpha (simulated)', rssi: -62, lastSeen: Date.now() },
  { id: 'demo-2', label: 'Hiker-7 (simulated)',         rssi: -78, lastSeen: Date.now() },
];

const DEMO_REPLIES = [
  'Demo mode — no real radio. Real BLE peers will appear here on hardware.',
  'Mesh relay active (simulated). Install on a second device for real comms.',
];

// ── State ────────────────────────────────────────────────────────────────────
const manager = new BleManager();
let messages: MeshMessage[] = [];
let knownPeers: Map<string, MeshPeer> = new Map();
let isDemo = false; // flips to true when BLE is unavailable

// ── Helpers ──────────────────────────────────────────────────────────────────

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const api = parseInt(Platform.Version as string, 10);

  if (api >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(result).every(
      v => v === PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
}

function getBluetoothState(): Promise<State> {
  return new Promise(resolve => {
    const sub = manager.onStateChange(state => {
      if (state !== State.Unknown) {
        sub.remove();
        resolve(state);
      }
    }, true);
    // Timeout after 3s in case it never resolves
    setTimeout(() => resolve(State.Unsupported), 3000);
  });
}

function addDemoReply() {
  setTimeout(() => {
    messages = [
      {
        id: `m-${Date.now()}-r`,
        from: 'Mesh (demo)',
        body: DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)],
        ts: Date.now(),
      },
      ...messages,
    ].slice(0, 50);
  }, 1200);
}

// ── Main service ─────────────────────────────────────────────────────────────

export const NearbyMeshService = {

  // Returns true if currently running in demo/fallback mode
  isDemoMode(): boolean {
    return isDemo;
  },

  async scan(): Promise<MeshPeer[]> {
    // ── Check BLE availability first ────────────────────────────────────────
    const bleState = await getBluetoothState();

    if (bleState === State.Unsupported || bleState === State.Unauthorized) {
      console.log('[BLE] Not available — falling back to demo mode');
      isDemo = true;
      return DEMO_PEERS.map(p => ({ ...p, lastSeen: Date.now() }));
    }

    if (bleState === State.PoweredOff) {
      console.log('[BLE] Bluetooth is off — falling back to demo mode');
      isDemo = true;
      return DEMO_PEERS.map(p => ({ ...p, lastSeen: Date.now() }));
    }

    // ── Request permissions ─────────────────────────────────────────────────
    const granted = await requestPermissions();
    if (!granted) {
      console.log('[BLE] Permissions denied — falling back to demo mode');
      isDemo = true;
      return DEMO_PEERS.map(p => ({ ...p, lastSeen: Date.now() }));
    }

    // ── Real BLE scan ───────────────────────────────────────────────────────
    isDemo = false;
    knownPeers.clear();
    console.log('[BLE] Starting real scan...');

    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        manager.stopDeviceScan();
        const found = Array.from(knownPeers.values());
        console.log(`[BLE] Scan complete — found ${found.length} device(s)`);

        // No real peers found — mix in demo peers so UI isn't empty
        if (found.length === 0) {
          console.log('[BLE] No peers found — showing demo peers as placeholder');
          isDemo = true;
          resolve(DEMO_PEERS.map(p => ({ ...p, lastSeen: Date.now() })));
        } else {
          resolve(found);
        }
      }, 8000);

      manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error: BleError | null, device: Device | null) => {
          if (error) {
            console.error('[BLE] Scan error:', error.message);
            clearTimeout(timeout);
            manager.stopDeviceScan();
            isDemo = true;
            resolve(DEMO_PEERS.map(p => ({ ...p, lastSeen: Date.now() })));
            return;
          }
          if (device) {
            knownPeers.set(device.id, {
              id: device.id,
              label: device.name || `Device (${device.id.slice(-5)})`,
              rssi: device.rssi ?? undefined,
              lastSeen: Date.now(),
            });
          }
        }
      );
    });
  },

  getMessages(): MeshMessage[] {
    return [...messages];
  },

  async broadcast(handle: string, text: string): Promise<void> {
    const msg: MeshMessage = {
      id: `m-${Date.now()}`,
      from: handle || 'You',
      body: text,
      ts: Date.now(),
    };
    messages = [msg, ...messages].slice(0, 50);

    // ── Demo mode — just echo a reply ───────────────────────────────────────
    if (isDemo) {
      console.log('[BLE] Demo mode — simulating broadcast');
      addDemoReply();
      return;
    }

    // ── Real BLE — write to all known peers ─────────────────────────────────
    const peers = Array.from(knownPeers.values());
    if (peers.length === 0) {
      console.log('[BLE] No peers to send to');
      return;
    }

    const payload = Buffer.from(
      JSON.stringify({ from: handle, body: text })
    ).toString('base64');

    for (const peer of peers) {
      try {
        const device = await manager.connectToDevice(peer.id);
        await device.discoverAllServicesAndCharacteristics();
        await device.writeCharacteristicWithResponseForService(
          MESH_SERVICE_UUID,
          MESH_CHARACTERISTIC_UUID,
          payload
        );
        await device.cancelConnection();
        console.log(`[BLE] Sent to ${peer.label}`);
      } catch (err: any) {
        console.warn(`[BLE] Failed to send to ${peer.label}:`, err.message);
      }
    }
  },

  clearDemoMessages() {
    messages = [];
  },

  destroy() {
    manager.stopDeviceScan();
    manager.destroy();
  },
};
// ```

// ---

// ## How the fallback logic works
// ```
// scan() called
//      │
//      ▼
// Is BLE supported & powered on?  ──No──▶  Demo peers shown
//      │
//     Yes
//      ▼
// Permissions granted?  ──No──▶  Demo peers shown
//      │
//     Yes
//      ▼
// Real 8s BLE scan runs
//      │
//      ▼
// Real peers found?  ──No──▶  Demo peers shown as placeholder
//      │
//     Yes
//      ▼
// Real peers shown, broadcast goes over GATT