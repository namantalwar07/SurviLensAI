import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

/**
 * Hidden camera used only to strobe the device torch during SOS.
 * Requires camera permission (request before setting active).
 */
export function SosTorchBlink({ active }: { active: boolean }) {
  const device = useCameraDevice('back');
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    if (!active || !device?.hasTorch) return;
    const id = setInterval(() => setTorchOn((o) => !o), 380);
    return () => clearInterval(id);
  }, [active, device?.hasTorch]);

  if (!active || !device?.hasTorch) {
    return null;
  }

  return (
    <View style={styles.wrap} pointerEvents="none" collapsable={false}>
      <Camera
        style={styles.cam}
        device={device}
        isActive={active}
        torch={torchOn ? 'on' : 'off'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 4,
    height: 4,
    opacity: 0.02,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  cam: { width: '100%', height: '100%' },
});
