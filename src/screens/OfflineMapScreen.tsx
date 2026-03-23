import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Mapbox from '@rnmapbox/maps';
import { AppColors } from '../theme';
import { useLocation, useStorage } from '../hooks';
import { RunAnywhere } from '@runanywhere/core';
import { computeSafeRoute } from '../utils/geoRouting';

// Initialize Mapbox with your token
Mapbox.setAccessToken('pk.eyJ1IjoibmFtYW50YWx3YXIwNyIsImEiOiJjbWZoNWxsbnAwOGZpMmpwd3Y5eHlyaGdyIn0.9svDV3meg6HgOPIEm8W5kg');

interface SavedLocation {
  id: string;
  name: string;
  type: 'safe' | 'danger' | 'resource' | 'shelter' | 'custom';
  latitude: number;
  longitude: number;
  timestamp: Date;
  notes: string;
}

const LOCATION_TYPES = [
  { type: 'safe' as const, icon: '✅', label: 'Safe Zone', color: '#10B981' },
  { type: 'danger' as const, icon: '⚠️', label: 'Danger', color: '#DC2626' },
  { type: 'resource' as const, icon: '💧', label: 'Water', color: '#3B82F6' },
  { type: 'shelter' as const, icon: '🏠', label: 'Shelter', color: '#F59E0B' },
  { type: 'custom' as const, icon: '📍', label: 'Custom', color: '#8B5CF6' },
];

export const OfflineMapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const showBack = navigation.canGoBack?.() ?? false;
  const { location, isLoading: locationLoading, getCurrentLocation, calculateDistance } = useLocation();
  const { value: savedLocations, setValue: setSavedLocations } = useStorage<SavedLocation[]>('saved_locations', []);
  
  const [showMap, setShowMap] = useState(true);
  const [selectedType, setSelectedType] = useState<SavedLocation['type'] | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [aiRouteBrief, setAiRouteBrief] = useState('');
  const [isRouteBriefing, setIsRouteBriefing] = useState(false);
  const [showDirectCompare, setShowDirectCompare] = useState(false);

  const cameraRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  const dangerPins = useMemo(
    () => savedLocations.filter((l) => l.type === 'danger'),
    [savedLocations]
  );

  const safeRouteCoords = useMemo(() => {
    if (!location || !selectedLocation || dangerPins.length === 0) return null;
    const dangers = dangerPins.map((d) => ({ lat: d.latitude, lon: d.longitude }));
    return computeSafeRoute(
      { lat: location.latitude, lon: location.longitude },
      { lat: selectedLocation.latitude, lon: selectedLocation.longitude },
      dangers,
      120
    );
  }, [location, selectedLocation, dangerPins]);

  const directCoords = useMemo((): [number, number][] | null => {
    if (!location || !selectedLocation) return null;
    return [
      [location.longitude, location.latitude],
      [selectedLocation.longitude, selectedLocation.latitude],
    ];
  }, [location, selectedLocation]);

  const saveLocation = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (!selectedType) {
      Alert.alert('Error', 'Please select a location type');
      return;
    }

    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name: locationName || `${LOCATION_TYPES.find(t => t.type === selectedType)?.label} ${new Date().toLocaleString()}`,
      type: selectedType,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date(),
      notes: locationNotes,
    };

    await setSavedLocations([...savedLocations, newLocation]);
    
    setLocationName('');
    setLocationNotes('');
    setSelectedType(null);
    
    Alert.alert('✅ Saved', `${newLocation.name} marked on map!`);
  };

  const deleteLocation = async (id: string) => {
    Alert.alert('Delete Location?', 'Remove this location from map?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await setSavedLocations(savedLocations.filter(loc => loc.id !== id));
        },
      },
    ]);
  };

  const downloadOfflineMap = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    Alert.alert(
      '📥 Download Offline Map',
      'Download map tiles for this area? (~50-100MB)\n\nWorks in airplane mode after download.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            setIsDownloading(true);
            setDownloadProgress(0);

            try {
              const bounds: [[number, number], [number, number]] = [
                [location.longitude - 0.15, location.latitude - 0.15],
                [location.longitude + 0.15, location.latitude + 0.15],
              ];

              const packOptions = {
                name: `survivlens_${Date.now()}`,
                styleURL: Mapbox.StyleURL.Street,
                minZoom: 10,
                maxZoom: 16,
                bounds: bounds,
              };

              await Mapbox.offlineManager.createPack(
                packOptions,
                (region: any, status: any) => {
                  const progress = status.percentage || 0;
                  setDownloadProgress(Math.round(progress * 100));
                }
              );

              setIsDownloading(false);
              Alert.alert('✅ Success!', 'Offline map downloaded!\n\nMap will work without internet now.');
            } catch (error) {
              console.error('Download error:', error);
              setIsDownloading(false);
              Alert.alert('Error', 'Failed to download offline map. Try again.');
            }
          },
        },
      ]
    );
  };

  const centerOnUser = () => {
    if (location && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  const navigateToLocation = (loc: SavedLocation) => {
    setSelectedLocation(loc);
    setShowMap(true);
    
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [loc.longitude, loc.latitude],
        zoomLevel: 16,
        animationDuration: 1500,
      });
    }
  };

  const generateRouteSafetyBrief = async () => {
    if (!location || !selectedLocation) {
      Alert.alert('Select destination', 'Choose a saved location first.');
      return;
    }
  
    setIsRouteBriefing(true);
    try {
      const dangerCount = savedLocations.filter(l => l.type === 'danger').length;
      const prompt = `
  You are SurviLens Navigation Safety AI.
  Create a compact route safety brief.
  
  Current:
  ${location.latitude}, ${location.longitude}
  
  Destination:
  ${selectedLocation.latitude}, ${selectedLocation.longitude}
  Name: ${selectedLocation.name}
  
  Known markers:
  - Total saved points: ${savedLocations.length}
  - Danger points: ${dangerCount}
  The map shows a GREEN detoured path that tries to avoid danger pins; RED halos = avoid zones.
  
  Provide:
  1) safest movement strategy (align with avoiding danger markers)
  2) terrain/weather assumptions
  3) hydration/rest cadence
  4) what to avoid
  5) emergency fallback plan
  Keep concise.
  `;
      const res = await RunAnywhere.generate(prompt, { maxTokens: 260, temperature: 0.35 });
      setAiRouteBrief(res.text);
    } catch (e) {
      Alert.alert('AI error', 'Failed to generate route brief.');
    } finally {
      setIsRouteBriefing(false);
    }
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.accentCyan} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🗺️</Text>
          <View>
            <Text style={styles.headerTitle}>GPS Navigator</Text>
            <Text style={styles.headerSubtitle}>Offline Maps • {savedLocations.length} Saved</Text>
          </View>
        </View>
      </LinearGradient>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setShowMap(true)}
          style={[styles.toggleBtn, showMap && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>🗺️ Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowMap(false)}
          style={[styles.toggleBtn, !showMap && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>📋 List</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={downloadOfflineMap} style={styles.downloadBtn} disabled={isDownloading}>
          <Text style={styles.downloadText}>
            {isDownloading ? `${downloadProgress}%` : '📥 Offline'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('NearbyMesh')}
          style={styles.meshMiniBtn}
        >
          <Text style={styles.meshMiniTxt}>📡</Text>
        </TouchableOpacity>
      </View>

      {showMap ? (
        <View style={styles.mapContainer}>
          <Mapbox.MapView
            ref={mapRef}
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            compassEnabled={true}
            compassViewPosition={3}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <Mapbox.Camera
              ref={cameraRef}
              zoomLevel={14}
              centerCoordinate={
                location
                  ? [location.longitude, location.latitude]
                  : [77.2090, 28.6139]
              }
              animationMode="flyTo"
              animationDuration={2000}
            />

            <Mapbox.UserLocation
              visible={true}
              showsUserHeadingIndicator={true}
              androidRenderMode="gps"
            />

            {savedLocations.map(loc => {
              const locType = LOCATION_TYPES.find(t => t.type === loc.type)!;
              return (
                <Mapbox.PointAnnotation
                  key={loc.id}
                  id={loc.id}
                  coordinate={[loc.longitude, loc.latitude]}
                  onSelected={() => setSelectedLocation(loc)}
                >
                  <View style={[styles.marker, { backgroundColor: locType.color }]}>
                    <Text style={styles.markerIcon}>{locType.icon}</Text>
                  </View>
                  <Mapbox.Callout title={loc.name} />
                </Mapbox.PointAnnotation>
              );
            })}

            {/* 🔴 Avoid zones — danger markers as red halos */}
            {dangerPins.length > 0 && (
              <Mapbox.ShapeSource
                id="dangerZones"
                shape={{
                  type: 'FeatureCollection',
                  features: dangerPins.map((d) => ({
                    type: 'Feature' as const,
                    geometry: {
                      type: 'Point' as const,
                      coordinates: [d.longitude, d.latitude],
                    },
                    properties: { id: d.id },
                  })),
                }}
              >
                <Mapbox.CircleLayer
                  id="dangerCircles"
                  style={{
                    circleRadius: 54,
                    circleColor: 'rgba(220, 38, 38, 0.24)',
                    circleStrokeColor: 'rgba(252, 165, 165, 0.95)',
                    circleStrokeWidth: 2.5,
                  }}
                />
              </Mapbox.ShapeSource>
            )}

            {/* 🟢 Safe route — detours around danger pins */}
            {selectedLocation && location && dangerPins.length > 0 && safeRouteCoords && (
              <Mapbox.ShapeSource
                id="safeRoute"
                shape={{
                  type: 'Feature',
                  geometry: { type: 'LineString', coordinates: safeRouteCoords },
                  properties: {},
                }}
              >
                <Mapbox.LineLayer
                  id="safeRouteLine"
                  style={{
                    lineColor: '#22c55e',
                    lineWidth: 5,
                    lineOpacity: 0.95,
                  }}
                />
              </Mapbox.ShapeSource>
            )}

            {/* Gray dashed = straight-line compare (optional) */}
            {selectedLocation &&
              location &&
              dangerPins.length > 0 &&
              showDirectCompare &&
              directCoords && (
                <Mapbox.ShapeSource
                  id="directCompare"
                  shape={{
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: directCoords },
                    properties: {},
                  }}
                >
                  <Mapbox.LineLayer
                    id="directCompareLine"
                    style={{
                      lineColor: 'rgba(148, 163, 184, 0.9)',
                      lineWidth: 3,
                      lineDasharray: [2, 2],
                    }}
                  />
                </Mapbox.ShapeSource>
              )}

            {/* Simple cyan path when no danger markers */}
            {selectedLocation && location && dangerPins.length === 0 && directCoords && (
              <Mapbox.ShapeSource
                id="route"
                shape={{
                  type: 'Feature',
                  geometry: { type: 'LineString', coordinates: directCoords },
                  properties: {},
                }}
              >
                <Mapbox.LineLayer
                  id="routeLine"
                  style={{
                    lineColor: '#00D9FF',
                    lineWidth: 3,
                    lineDasharray: [2, 2],
                  }}
                />
              </Mapbox.ShapeSource>
            )}
          </Mapbox.MapView>

          {/* Map legend */}
          {showMap && (
            <View style={styles.mapLegend}>
              <Text style={styles.legendTitle}>Route legend</Text>
              <Text style={styles.legendRow}>
                <Text style={styles.legendDotGreen}>━━</Text> Safe path (avoids ⚠️ pins)
              </Text>
              <Text style={styles.legendRow}>
                <Text style={styles.legendDotRed}>⬤</Text> Avoid zone (danger)
              </Text>
              {dangerPins.length > 0 && (
                <TouchableOpacity
                  style={styles.legendToggle}
                  onPress={() => setShowDirectCompare((v) => !v)}
                >
                  <Text style={styles.legendToggleText}>
                    {showDirectCompare ? 'Hide' : 'Show'} straight line (risky)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Floating Controls */}
          <TouchableOpacity onPress={centerOnUser} style={styles.centerBtn}>
            <Text style={styles.centerIcon}>📍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedType(selectedType ? null : 'custom')}
            style={styles.addBtn}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.addGradient}>
              <Text style={styles.addIcon}>{selectedType ? '✕' : '+'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Selected Location Info */}
          {/* {selectedLocation && (
            <View style={styles.selectedLocationCard}>
              <View style={styles.selectedLocationHeader}>
                <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
                <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              {location && (
                <Text style={styles.selectedLocationDistance}>
                  📏 {calculateDistance(
                    location.latitude,
                    location.longitude,
                    selectedLocation.latitude,
                    selectedLocation.longitude
                  )} away
                </Text>
              )}
              {selectedLocation.notes && (
                <Text style={styles.selectedLocationNotes}>{selectedLocation.notes}</Text>
              )}
            </View>
          )} */}
          {selectedLocation && (
  <View style={styles.selectedLocationCard}>
    
    <View style={styles.selectedLocationHeader}>
      <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
      <TouchableOpacity onPress={() => setSelectedLocation(null)}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </View>

    {location && (
      <Text style={styles.selectedLocationDistance}>
        📏 {calculateDistance(
          location.latitude,
          location.longitude,
          selectedLocation.latitude,
          selectedLocation.longitude
        )} away
      </Text>
    )}

    {selectedLocation.notes && (
      <Text style={styles.selectedLocationNotes}>
        {selectedLocation.notes}
      </Text>
    )}

    {/* 🔥 ADD HERE — BUTTON */}
    <TouchableOpacity
      onPress={generateRouteSafetyBrief}
      style={{
        marginTop: 10,
        backgroundColor: '#0EA5E9',
        borderRadius: 10,
        padding: 10,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
        {isRouteBriefing ? 'Generating...' : 'AI Route Safety Brief'}
      </Text>
    </TouchableOpacity>

    {/* 🔥 ADD HERE — AI RESULT */}
    {aiRouteBrief ? (
      <View
        style={{
          marginTop: 10,
          backgroundColor: AppColors.primaryMid,
          borderRadius: 10,
          padding: 10,
        }}
      >
        <Text
          style={{
            color: AppColors.textPrimary,
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {aiRouteBrief}
        </Text>
      </View>
    ) : null}

  </View>
)}

          {/* Add Location Panel */}
          {selectedType && (
            <View style={styles.addLocationPanel}>
              <Text style={styles.addLocationTitle}>Mark Location</Text>
              
              <View style={styles.typeSelector}>
                {LOCATION_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.type}
                    onPress={() => setSelectedType(type.type)}
                    style={[
                      styles.typeOption,
                      selectedType === type.type && { backgroundColor: type.color + '33', borderColor: type.color },
                    ]}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={styles.typeLabel}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.nameInput}
                placeholder="Location name (optional)"
                placeholderTextColor={AppColors.textMuted}
                value={locationName}
                onChangeText={setLocationName}
              />

              <TextInput
                style={styles.notesInput}
                placeholder="Notes (optional)"
                placeholderTextColor={AppColors.textMuted}
                value={locationNotes}
                onChangeText={setLocationNotes}
                multiline
              />

              <TouchableOpacity onPress={saveLocation} style={styles.saveBtn}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.saveGradient}>
                  <Text style={styles.saveBtnText}>💾 Save Location</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.listView} showsVerticalScrollIndicator={false}>
          {/* Current Location */}
          {location && (
            <View style={styles.currentCard}>
              <View style={styles.currentHeader}>
                <Text style={styles.currentTitle}>📍 Your Location</Text>
                <TouchableOpacity onPress={getCurrentLocation}>
                  <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.coordText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              {location.accuracy && (
                <Text style={styles.accuracyText}>±{location.accuracy.toFixed(0)}m accuracy</Text>
              )}
            </View>
          )}

          {/* Saved Locations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 Saved Locations ({savedLocations.length})</Text>
            
            {savedLocations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📍</Text>
                <Text style={styles.emptyText}>No locations saved yet</Text>
                <Text style={styles.emptySubtext}>
                  Switch to map view and tap + to mark locations
                </Text>
              </View>
            ) : (
              savedLocations.map(loc => {
                const locType = LOCATION_TYPES.find(t => t.type === loc.type)!;
                const distance = location
                  ? calculateDistance(
                      location.latitude,
                      location.longitude,
                      loc.latitude,
                      loc.longitude
                    )
                  : null;

                return (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => navigateToLocation(loc)}
                    style={styles.locationCard}
                  >
                    <View style={[styles.colorBar, { backgroundColor: locType.color }]} />
                    <View style={styles.locationContent}>
                      <View style={styles.locationHeader}>
                        <Text style={styles.locationIcon}>{locType.icon}</Text>
                        <Text style={styles.locationName}>{loc.name}</Text>
                      </View>
                      <Text style={styles.locationCoords}>
                        {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                      </Text>
                      {distance && (
                        <Text style={styles.locationDistance}>📏 {distance} away</Text>
                      )}
                      {loc.notes && (
                        <Text style={styles.locationNotes}>{loc.notes}</Text>
                      )}
                      <Text style={styles.locationTime}>
                        {new Date(loc.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteLocation(loc.id);
                      }}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🗺️ Offline GPS Navigator</Text>
            <Text style={styles.infoText}>
              ✅ Real-time GPS tracking{'\n'}
              ✅ Mark unlimited locations{'\n'}
              ✅ Distance calculation{'\n'}
              ✅ Download offline maps{'\n'}
              ✅ Works in airplane mode{'\n'}
              ✅ Route visualization
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primaryDark },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.primaryDark },
  loadingText: { fontSize: 16, color: AppColors.textPrimary, marginTop: 12 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: { width: 40, height: 40 },
  backIcon: { fontSize: 24, color: '#fff', fontWeight: '700' },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { fontSize: 32 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // Toggle
  toggleContainer: { flexDirection: 'row', flexWrap: 'wrap', margin: 16, gap: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toggleBtnActive: {
    backgroundColor: '#10B981' + '33',
    borderColor: '#10B981',
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: AppColors.textSecondary },
  toggleTextActive: { color: '#10B981' },
  downloadBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
  },
  downloadText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  meshMiniBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    justifyContent: 'center',
  },
  meshMiniTxt: { fontSize: 15 },

  // Map
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIcon: { fontSize: 20 },

  // Floating buttons
  centerBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  centerIcon: { fontSize: 24 },
  
  addBtn: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: { fontSize: 32, color: '#fff', fontWeight: '700' },

  // Selected Location Card
  selectedLocationCard: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLocationName: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary, flex: 1 },
  closeIcon: { fontSize: 20, color: AppColors.textMuted },
  selectedLocationDistance: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 4 },
  selectedLocationNotes: { fontSize: 13, color: AppColors.textSecondary, fontStyle: 'italic' },

  // Add Location Panel
  addLocationPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  addLocationTitle: { fontSize: 18, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 16 },
  
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeOption: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: AppColors.primaryMid,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 11, color: AppColors.textSecondary, fontWeight: '600' },

  nameInput: {
    backgroundColor: AppColors.primaryMid,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: AppColors.primaryMid,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: AppColors.textPrimary,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: { borderRadius: 12, overflow: 'hidden' },
  saveGradient: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // List View
  listView: { flex: 1, padding: 16 },
  
  currentCard: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981' + '33',
  },
  currentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  currentTitle: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
  refreshIcon: { fontSize: 20 },
  coordText: { fontSize: 14, color: AppColors.textSecondary, fontFamily: 'monospace', marginBottom: 4 },
  accuracyText: { fontSize: 12, color: AppColors.textMuted },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 12 },
  
  emptyState: { alignItems: 'center', padding: 40, backgroundColor: AppColors.surfaceCard, borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: AppColors.textPrimary, marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: AppColors.textSecondary, textAlign: 'center' },

  locationCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  colorBar: { width: 4 },
  locationContent: { flex: 1, padding: 16 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  locationIcon: { fontSize: 20 },
  locationName: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary, flex: 1 },
  locationCoords: { fontSize: 12, color: AppColors.textSecondary, fontFamily: 'monospace', marginBottom: 4 },
  locationDistance: { fontSize: 12, color: '#10B981', fontWeight: '600', marginBottom: 4 },
  locationNotes: { fontSize: 12, color: AppColors.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  locationTime: { fontSize: 11, color: AppColors.textMuted },
  deleteBtn: { justifyContent: 'center', paddingHorizontal: 16 },
  deleteIcon: { fontSize: 20 },

  infoCard: {
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981' + '33',
  },
  infoTitle: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary, marginBottom: 12 },
  infoText: { fontSize: 13, color: AppColors.textSecondary, lineHeight: 22 },

  mapLegend: {
    position: 'absolute',
    left: 10,
    bottom: 96,
    backgroundColor: 'rgba(15,23,42,0.93)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxWidth: 230,
  },
  legendTitle: { color: '#fff', fontWeight: '800', fontSize: 11, marginBottom: 6 },
  legendRow: { color: AppColors.textSecondary, fontSize: 11, marginBottom: 4 },
  legendDotGreen: { color: '#22c55e', fontWeight: '900' },
  legendDotRed: { color: '#fca5a5', fontWeight: '900' },
  legendToggle: { marginTop: 4, paddingVertical: 4 },
  legendToggleText: { color: AppColors.accentCyan, fontSize: 11, fontWeight: '700' },
});
