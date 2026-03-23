// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   StatusBar,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { AppColors } from '../theme';
// import { NearbyMeshService, MeshPeer, MeshMessage } from '../services/NearbyMeshService';

// export const NearbyMeshScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [peers, setPeers] = useState<MeshPeer[]>([]);
//   const [msgs, setMsgs] = useState<MeshMessage[]>([]);
//   const [scanning, setScanning] = useState(false);
//   const [handle, setHandle] = useState('Hiker-1');
//   const [outbox, setOutbox] = useState('');
//   const [sending, setSending] = useState(false);
//   const demoMode = NearbyMeshService.isDemoMode();

//   const refreshMsgs = useCallback(() => {
//     setMsgs(NearbyMeshService.getMessages());
//   }, []);

//   const runScan = async () => {
//     setScanning(true);
//     try {
//       const found = await NearbyMeshService.scan();
//       setPeers(found);
//     } finally {
//       setScanning(false);
//     }
//   };

//   const send = async () => {
//     const t = outbox.trim();
//     if (!t) return;
//     setSending(true);
//     try {
//       await NearbyMeshService.broadcast(handle, t);
//       setOutbox('');
//       refreshMsgs();
//       setTimeout(refreshMsgs, 1500);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
//           <Text style={styles.backTxt}>←</Text>
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.title}>Nearby mesh</Text>
//           <Text style={styles.sub}>Offline peer ping (BLE / Wi‑Direct ready)</Text>
//         </View>
//       </LinearGradient>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollInner}
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.banner}>
//           <Text style={styles.bannerTxt}>
//             📡 Demo: simulated peers. Wire <Text style={{ fontWeight: '800' }}>NearbyMeshService</Text>{' '}
//             to Bluetooth advertising + GATT for real range.
//           </Text>
//         </View>

//         <TouchableOpacity style={styles.scanBtn} onPress={runScan} disabled={scanning}>
//           {scanning ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.scanTxt}>Is anyone nearby?</Text>
//           )}
//         </TouchableOpacity>

//         <Text style={styles.section}>Peers ({peers.length})</Text>
//         {peers.length === 0 ? (
//           <Text style={styles.empty}>Tap scan — demo shows a simulated device.</Text>
//         ) : (
//           peers.map((item) => (
//             <View key={item.id} style={styles.peer}>
//               <Text style={styles.peerName}>{item.label}</Text>
//               <Text style={styles.peerMeta}>
//                 {item.rssi != null ? `${item.rssi} dBm · ` : ''}mesh-ready
//               </Text>
//             </View>
//           ))
//         )}

//         <Text style={styles.section}>Shout (broadcast)</Text>
//         <TextInput
//           style={styles.handle}
//           value={handle}
//           onChangeText={setHandle}
//           placeholder="Your handle"
//           placeholderTextColor={AppColors.textMuted}
//         />
//         <TextInput
//           style={styles.input}
//           value={outbox}
//           onChangeText={setOutbox}
//           placeholder='e.g. "Need water — 200m east of trail fork"'
//           placeholderTextColor={AppColors.textMuted}
//           multiline
//         />
//         <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending}>
//           {sending ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.sendTxt}>Broadcast</Text>
//           )}
//         </TouchableOpacity>

//         <Text style={styles.section}>Inbox</Text>
//         {msgs.length === 0 ? (
//           <Text style={styles.empty}>No messages yet.</Text>
//         ) : (
//           msgs.map((item) => (
//             <View key={item.id} style={styles.msg}>
//               <Text style={styles.msgFrom}>{item.from}</Text>
//               <Text style={styles.msgBody}>{item.body}</Text>
//             </View>
//           ))
//         )}
//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: AppColors.primaryDark },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 52,
//     paddingBottom: 16,
//     paddingHorizontal: 14,
//     gap: 10,
//   },
//   back: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backTxt: { color: '#fff', fontSize: 22, fontWeight: '700' },
//   title: { fontSize: 22, fontWeight: '800', color: '#fff' },
//   sub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
//   scroll: { flex: 1 },
//   scrollInner: { paddingBottom: 24 },
//   banner: {
//     marginHorizontal: 14,
//     marginBottom: 10,
//     padding: 12,
//     backgroundColor: 'rgba(99,102,241,0.2)',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(99,102,241,0.4)',
//   },
//   bannerTxt: { fontSize: 12, color: '#c7d2fe', lineHeight: 18 },
//   scanBtn: {
//     marginHorizontal: 14,
//     backgroundColor: '#4f46e5',
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: 'center',
//   },
//   scanTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
//   section: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: AppColors.textMuted,
//     letterSpacing: 1,
//     marginLeft: 14,
//     marginTop: 16,
//     marginBottom: 6,
//   },
//   peer: {
//     marginHorizontal: 14,
//     backgroundColor: AppColors.surfaceCard,
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 8,
//   },
//   peerName: { color: '#fff', fontWeight: '700' },
//   peerMeta: { color: AppColors.textMuted, fontSize: 12, marginTop: 4 },
//   empty: { color: AppColors.textMuted, fontSize: 13, paddingHorizontal: 14, marginBottom: 8 },
//   handle: {
//     marginHorizontal: 14,
//     backgroundColor: AppColors.surfaceCard,
//     borderRadius: 10,
//     padding: 12,
//     color: '#fff',
//     marginBottom: 8,
//   },
//   input: {
//     marginHorizontal: 14,
//     backgroundColor: AppColors.surfaceCard,
//     borderRadius: 12,
//     padding: 12,
//     color: '#fff',
//     minHeight: 72,
//     textAlignVertical: 'top',
//   },
//   sendBtn: {
//     marginHorizontal: 14,
//     marginTop: 10,
//     backgroundColor: '#6366f1',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   sendTxt: { color: '#fff', fontWeight: '800' },
//   msg: {
//     marginHorizontal: 14,
//     backgroundColor: 'rgba(255,255,255,0.06)',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 8,
//   },
//   msgFrom: { color: AppColors.accentCyan, fontSize: 12, fontWeight: '700' },
//   msgBody: { color: '#fff', marginTop: 4, lineHeight: 20 },
// });


import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppColors } from '../theme';
import { NearbyMeshService, MeshPeer, MeshMessage } from '../services/NearbyMeshService';

export const NearbyMeshScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [peers, setPeers] = useState<MeshPeer[]>([]);
  const [msgs, setMsgs] = useState<MeshMessage[]>([]);
  const [scanning, setScanning] = useState(false);
  const [handle, setHandle] = useState('Hiker-1');
  const [outbox, setOutbox] = useState('');
  const [sending, setSending] = useState(false);
  const [demoMode, setDemoMode] = useState<boolean | null>(null); // null = not scanned yet

  const refreshMsgs = useCallback(() => {
    setMsgs(NearbyMeshService.getMessages());
  }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const found = await NearbyMeshService.scan();
      setPeers(found);
      setDemoMode(NearbyMeshService.isDemoMode());
      refreshMsgs();
    } finally {
      setScanning(false);
    }
  };

  const send = async () => {
    const t = outbox.trim();
    if (!t) return;
    setSending(true);
    try {
      await NearbyMeshService.broadcast(handle, t);
      setOutbox('');
      refreshMsgs();
      setTimeout(refreshMsgs, 1500);
    } finally {
      setSending(false);
    }
  };

  const getBannerConfig = () => {
    if (demoMode === null) {
      return {
        color: 'rgba(99,102,241,0.2)',
        border: 'rgba(99,102,241,0.4)',
        text: '📡 Tap scan to find nearby mesh peers. Works on real devices with BLE.',
        textColor: '#c7d2fe',
      };
    }
    if (demoMode) {
      return {
        color: 'rgba(234,179,8,0.15)',
        border: 'rgba(234,179,8,0.4)',
        text: '🟡 Demo mode — BLE unavailable or no real peers found. Showing simulated data.',
        textColor: '#fef08a',
      };
    }
    return {
      color: 'rgba(34,197,94,0.15)',
      border: 'rgba(34,197,94,0.4)',
      text: '🟢 Live BLE — scanning real devices in range.',
      textColor: '#bbf7d0',
    };
  };

  const banner = getBannerConfig();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nearby mesh</Text>
          <Text style={styles.sub}>Offline peer ping · BLE</Text>
        </View>
        {demoMode !== null && (
          <View style={[styles.modeBadge, { backgroundColor: demoMode ? 'rgba(234,179,8,0.25)' : 'rgba(34,197,94,0.25)' }]}>
            <Text style={[styles.modeBadgeTxt, { color: demoMode ? '#fef08a' : '#bbf7d0' }]}>
              {demoMode ? 'DEMO' : 'LIVE'}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: banner.color, borderColor: banner.border }]}>
          <Text style={[styles.bannerTxt, { color: banner.textColor }]}>{banner.text}</Text>
        </View>

        {/* Scan button */}
        <TouchableOpacity style={styles.scanBtn} onPress={runScan} disabled={scanning}>
          {scanning ? (
            <View style={styles.scanningRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.scanTxt}>  Scanning BLE (8s)...</Text>
            </View>
          ) : (
            <Text style={styles.scanTxt}>Is anyone nearby?</Text>
          )}
        </TouchableOpacity>

        {/* Peers */}
        <Text style={styles.section}>Peers ({peers.length})</Text>
        {peers.length === 0 ? (
          <Text style={styles.empty}>
            {scanning ? 'Scanning...' : 'Tap scan to discover nearby devices.'}
          </Text>
        ) : (
          peers.map((item) => (
            <View key={item.id} style={styles.peer}>
              <View style={styles.peerRow}>
                <View style={[
                  styles.peerDot,
                  { backgroundColor: item.id.startsWith('demo') ? '#facc15' : '#4ade80' }
                ]} />
                <Text style={styles.peerName}>{item.label}</Text>
              </View>
              <Text style={styles.peerMeta}>
                {item.rssi != null ? `${item.rssi} dBm · ` : ''}
                {item.id.startsWith('demo') ? 'simulated' : 'mesh-ready'}
              </Text>
            </View>
          ))
        )}

        {/* Broadcast */}
        <Text style={styles.section}>Shout (broadcast)</Text>
        <TextInput
          style={styles.handle}
          value={handle}
          onChangeText={setHandle}
          placeholder="Your handle"
          placeholderTextColor={AppColors.textMuted}
        />
        <TextInput
          style={styles.input}
          value={outbox}
          onChangeText={setOutbox}
          placeholder='e.g. "Need water — 200m east of trail fork"'
          placeholderTextColor={AppColors.textMuted}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!outbox.trim() || sending) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={sending || !outbox.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendTxt}>📣 Broadcast</Text>
          )}
        </TouchableOpacity>

        {/* Inbox */}
        <View style={styles.inboxHeader}>
          <Text style={styles.section}>Inbox</Text>
          {msgs.length > 0 && (
            <TouchableOpacity onPress={() => {
              NearbyMeshService.clearDemoMessages();
              refreshMsgs();
            }}>
              <Text style={styles.clearTxt}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {msgs.length === 0 ? (
          <Text style={styles.empty}>No messages yet.</Text>
        ) : (
          msgs.map((item) => (
            <View key={item.id} style={[
              styles.msg,
              item.from === 'Mesh (demo)' && styles.msgDemo
            ]}>
              <View style={styles.msgTopRow}>
                <Text style={styles.msgFrom}>{item.from}</Text>
                <Text style={styles.msgTime}>
                  {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.msgBody}>{item.body}</Text>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 14,
    gap: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backTxt: { color: '#fff', fontSize: 22, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modeBadgeTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollInner: { padding: 14, paddingBottom: 24 },
  banner: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerTxt: { fontSize: 12, lineHeight: 18 },
  scanBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  scanningRow: { flexDirection: 'row', alignItems: 'center' },
  scanTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  section: {
    fontSize: 11,
    fontWeight: '800',
    color: AppColors.textMuted,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
  },
  peer: {
    backgroundColor: AppColors.surfaceCard,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  peerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  peerDot: { width: 8, height: 8, borderRadius: 4 },
  peerName: { color: '#fff', fontWeight: '700' },
  peerMeta: { color: AppColors.textMuted, fontSize: 12, marginTop: 4, marginLeft: 16 },
  empty: { color: AppColors.textMuted, fontSize: 13, marginBottom: 8 },
  handle: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    minHeight: 72,
    textAlignVertical: 'top',
  },
  sendBtn: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendTxt: { color: '#fff', fontWeight: '800' },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 6,
  },
  clearTxt: { color: AppColors.textMuted, fontSize: 12 },
  msg: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  msgDemo: {
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    backgroundColor: 'rgba(234,179,8,0.05)',
  },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  msgFrom: { color: AppColors.accentCyan, fontSize: 12, fontWeight: '700' },
  msgTime: { color: AppColors.textMuted, fontSize: 11 },
  msgBody: { color: '#fff', lineHeight: 20 },
});