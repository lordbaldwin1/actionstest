import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import customMapStyle from "./mapStyle.json"; // Import the custom map style
import API_BASE_URL from "../../apiConfig.js"; // Import API configuration

const initialRegion = {
  latitude: 45.54698979840522,
  longitude: -122.66310214492715,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

/**
 * Debounce function to delay the execution of a callback.
 *
 * @param func - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns - The debounced function.
 * @template T
 */
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout: number = 5000,
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout),
    ),
  ]);
};

export default function MapScreen(): JSX.Element {
  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [markers, setMarkers] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const mapRef = useRef<ClusteredMapView>(null);
  const isCenteringRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch location data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}`, {}, 5000); // Use fetchWithTimeout
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`,
          );
        }
        const data = await response.json();
        const fetchedMarkers = data.map(
          (location: { latitude: number; longitude: number }) => ({
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        );
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchData();
  }, []);

  // Set initial position
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentPosition(newPosition);
      const newRegion = {
        ...currentRegion,
        latitude: newPosition.latitude,
        longitude: newPosition.longitude,
      };
      setCurrentRegion(newRegion);
      // @ts-ignore - animateToRegion isn't properly recognized for react-native-map-clustering.
      mapRef.current?.animateToRegion(newRegion, 1000);
    })();
  }, []);

  /**
   * Centers the map on the current location.
   */
  const centerOnCurrentLocation = async () => {
    isCenteringRef.current = true;
    // Clear any ongoing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentPosition(newPosition);
      const newRegion = {
        ...currentRegion,
        latitude: newPosition.latitude,
        longitude: newPosition.longitude,
      };
      // @ts-ignore - animateToRegion isn't properly recognized for react-native-map-clustering.
      mapRef.current?.animateToRegion(newRegion, 1000);

      animationTimeoutRef.current = setTimeout(() => {
        isCenteringRef.current = false;
        setCurrentRegion(newRegion); // Update state after animation completes
        animationTimeoutRef.current = null;
      }, 1000); // Ensure the centering flag is reset after animation
    } catch (error) {
      console.log("Error getting location:", error);
      isCenteringRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <ClusteredMapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={customMapStyle}
        region={currentRegion}
        onRegionChange={debounce((region) => {
          if (!isCenteringRef.current) {
            setCurrentRegion(region);
          }
        }, 500)}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker} />
        ))}
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            title="Current Location"
            pinColor="blue"
          />
        )}
      </ClusteredMapView>
      <TouchableOpacity style={styles.button} onPress={centerOnCurrentLocation}>
        <Ionicons name="locate-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
