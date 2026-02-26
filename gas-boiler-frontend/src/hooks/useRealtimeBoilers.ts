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

export const useRealtimeBoilers = (token: string) => {
  const [boilerPowers, setBoilerPowers] = useState<Map<number, BoilerPowerUpdate>>(new Map());
  const [temperatures, setTemperatures] = useState<Map<number, IndoorTempUpdate>>(new Map());
  const [capacityWarnings, setCapacityWarnings] = useState<Map<number, CapacityWarning>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { connection, isConnected } = useSignalR(
    'https://localhost:44314/boilerHub',
    token
  );

  useSignalREvent<BoilerPowerUpdate>(connection, 'BoilerPowerUpdated', (data) => {
    setBoilerPowers((prev) => {
      const updated = new Map(prev);
      updated.set(data.boilerId, data);
      return updated;
    });
    setLastUpdate(new Date());
  });

  useSignalREvent<IndoorTempUpdate>(connection, 'IndoorTemperatureUpdated', (data) => {
    setTemperatures((prev) => {
      const updated = new Map(prev);
      updated.set(data.buildingId, data);
      return updated;
    });
    setLastUpdate(new Date());
  });

  useSignalREvent<CapacityWarning>(connection, 'CapacityWarning', (data) => {
    setCapacityWarnings((prev) => {
      const updated = new Map(prev);
      updated.set(data.buildingId, data);
      return updated;
    });
    setLastUpdate(new Date());

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
