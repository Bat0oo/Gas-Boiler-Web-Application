import { useEffect, useState } from 'react';
import { useSignalR, useSignalREvent } from './useSignalR';

interface BoilerPowerUpdate {
  boilerId: number;
  boilerName: string;
  buildingId: number;
  buildingName: string;
  oldPower: number;
  newPower: number;
  maxPower: number;
  timestamp: string;
}

interface IndoorTempUpdate {
  buildingId: number;
  buildingName: string;
  temperature: number;
  desiredTemperature: number;
  error: number;
  outdoorTemperature: number;
  timestamp: string;
}

interface CapacityWarning {
  buildingId: number;
  buildingName: string;
  requiredPower: number;
  availablePower: number;
  deficit: number;
  timestamp: string;
}

/**
 * Hook to receive real-time P-Controller updates via SignalR
 * Updates every 1 minute when P-Controller runs
 */
export const useRealtimeBoilers = (token: string) => {
  const [boilerPowers, setBoilerPowers] = useState<Map<number, BoilerPowerUpdate>>(new Map());
  const [temperatures, setTemperatures] = useState<Map<number, IndoorTempUpdate>>(new Map());
  const [capacityWarnings, setCapacityWarnings] = useState<Map<number, CapacityWarning>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Connect to SignalR
  const { connection, isConnected } = useSignalR(
    'https://localhost:44314/boilerHub',
    token
  );

  // Listen for boiler power updates (every 1 min)
  useSignalREvent<BoilerPowerUpdate>(connection, 'BoilerPowerUpdated', (data) => {
    console.log('🔧 Boiler power updated:', data);
    
    setBoilerPowers((prev) => {
      const updated = new Map(prev);
      updated.set(data.boilerId, data);
      return updated;
    });
    
    setLastUpdate(new Date());
  });

  // Listen for indoor temperature updates (every 1 min)
  useSignalREvent<IndoorTempUpdate>(connection, 'IndoorTemperatureUpdated', (data) => {
    console.log('🌡️ Indoor temperature updated:', data);
    
    setTemperatures((prev) => {
      const updated = new Map(prev);
      updated.set(data.buildingId, data);
      return updated;
    });
    
    setLastUpdate(new Date());
  });

  // Listen for capacity warnings (when capacity insufficient)
  useSignalREvent<CapacityWarning>(connection, 'CapacityWarning', (data) => {
    console.warn('⚠️ Capacity warning:', data);
    
    setCapacityWarnings((prev) => {
      const updated = new Map(prev);
      updated.set(data.buildingId, data);
      return updated;
    });
    
    setLastUpdate(new Date());
    
    // Optional: Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`⚠️ Capacity Warning: ${data.buildingName}`, {
        body: `Deficit: ${data.deficit.toFixed(1)} kW`,
        icon: '/favicon.ico',
      });
    }
  });

  return {
    boilerPowers,
    temperatures,
    capacityWarnings,
    lastUpdate,
    isConnected,
  };
};

/**
 * Helper: Get real-time data for a specific building
 */
export const useBuildingRealtime = (buildingId: number, token: string) => {
  const { boilerPowers, temperatures, capacityWarnings, isConnected, lastUpdate } = 
    useRealtimeBoilers(token);

  const temperature = temperatures.get(buildingId);
  const buildingBoilers = Array.from(boilerPowers.values())
    .filter(b => b.buildingId === buildingId);
  const warning = capacityWarnings.get(buildingId);

  return {
    temperature,
    boilers: buildingBoilers,
    capacityWarning: warning,
    isConnected,
    lastUpdate,
  };
};