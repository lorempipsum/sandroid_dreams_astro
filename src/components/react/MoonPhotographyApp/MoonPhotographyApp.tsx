import React, { useState, useEffect } from 'react';
import SunCalc from 'suncalc';
import { Observer, EclipticLongitude, SearchMoonPhase, MoonPhase } from 'astronomy-engine';
import './MoonPhotographyApp.module.scss';

interface AstronomicalEvent {
  date: Date;
  type: 'optimal' | 'good' | 'fair';
  events: string[];
  moonPhase: number;
  moonAltitude: number;
  description: string;
}

interface TideData {
  time: Date;
  height: number;
  type: 'high' | 'low';
}

const MoonPhotographyApp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location] = useState({ lat: 51.4545, lng: -2.5879 }); // Bristol, UK
  const [minAltitude, setMinAltitude] = useState<number>(30);
  const [optimalEvents, setOptimalEvents] = useState<AstronomicalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Calculate astronomical events for a given date
  const calculateAstronomicalData = (date: Date) => {
    const times = SunCalc.getTimes(date, location.lat, location.lng);
    const moonTimes = SunCalc.getMoonTimes(date, location.lat, location.lng);
    const moonPosition = SunCalc.getMoonPosition(date, location.lat, location.lng);
    const moonIllumination = SunCalc.getMoonIllumination(date);

    return {
      sun: times,
      moon: moonTimes,
      moonPosition,
      moonIllumination,
    };
  };

  // Calculate moon phase for a given date
  const getMoonPhase = (date: Date): number => {
    try {
      const observer = new Observer(location.lat, location.lng, 0);
      const moonIllumination = SunCalc.getMoonIllumination(date);
      return moonIllumination.phase;
    } catch (error) {
      console.error('Error calculating moon phase:', error);
      return 0;
    }
  };

  // Check if moon is at optimal position (low in sky)
  const isMoonOptimal = (date: Date, altitude: number): boolean => {
    const moonPosition = SunCalc.getMoonPosition(date, location.lat, location.lng);
    const altitudeDegrees = (moonPosition.altitude * 180) / Math.PI;
    return altitudeDegrees > 0 && altitudeDegrees <= altitude;
  };

  // Find optimal photography times
  const findOptimalTimes = (startDate: Date, days: number = 30) => {
    setIsLoading(true);
    const events: AstronomicalEvent[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const astroData = calculateAstronomicalData(currentDate);
      const moonPhase = getMoonPhase(currentDate);

      // Check various times throughout the day for optimal conditions
      const timesToCheck = [
        astroData.sun.sunrise,
        astroData.sun.sunset,
        astroData.moon.rise,
        astroData.moon.set,
        astroData.sun.goldenHour,
        astroData.sun.goldenHourEnd,
      ].filter(time => time && !isNaN(time.getTime()));

      for (const time of timesToCheck) {
        if (!time) continue;

        const moonPosition = SunCalc.getMoonPosition(time, location.lat, location.lng);
        const moonAltitude = (moonPosition.altitude * 180) / Math.PI;

        const eventTypes: string[] = [];
        let eventType: 'optimal' | 'good' | 'fair' = 'fair';

        // Check for sunrise/sunset + moonrise/moonset alignment (within 1 hour)
        const timeDiff = Math.abs(time.getTime() - astroData.moon.rise?.getTime() || Infinity);
        if (timeDiff < 3600000) { // Within 1 hour
          eventTypes.push('Moon rise aligns with golden hour');
          eventType = 'optimal';
        }

        const sunsetDiff = Math.abs(time.getTime() - astroData.sun.sunset?.getTime() || Infinity);
        if (sunsetDiff < 3600000) {
          eventTypes.push('Moon visible during sunset');
          eventType = 'good';
        }

        // Check if moon is low in sky
        if (moonAltitude > 0 && moonAltitude <= minAltitude) {
          eventTypes.push(`Moon low in sky (${moonAltitude.toFixed(1)}°)`);
          eventType = eventType === 'optimal' ? 'optimal' : 'good';
        }

        // Check moon phase for photography appeal
        if (moonPhase > 0.3 && moonPhase < 0.7) {
          eventTypes.push('Good moon phase for detail');
          eventType = eventType === 'optimal' ? 'optimal' : 'good';
        }

        if (eventTypes.length > 0) {
          events.push({
            date: new Date(time),
            type: eventType,
            events: eventTypes,
            moonPhase,
            moonAltitude,
            description: `Moon at ${moonAltitude.toFixed(1)}° altitude, ${(moonPhase * 100).toFixed(0)}% illuminated`,
          });
        }
      }
    }

    // Sort by date and filter duplicates
    const sortedEvents = events
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .filter((event, index, arr) => {
        // Remove events within 30 minutes of each other
        if (index === 0) return true;
        const prevEvent = arr[index - 1];
        return Math.abs(event.date.getTime() - prevEvent.date.getTime()) > 1800000;
      });

    setOptimalEvents(sortedEvents);
    setIsLoading(false);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate events when component mounts or date changes
  useEffect(() => {
    findOptimalTimes(selectedDate);
  }, [selectedDate, minAltitude]);

  return (
    <div className="moon-photography-app">
      <div className="header">
        <h1>Moon Photography Planner</h1>
        <p>Find optimal times for moon photography in Bristol, UK</p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="date-picker">Start Date:</label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="altitude-slider">Max Moon Altitude (°):</label>
          <input
            id="altitude-slider"
            type="range"
            min="10"
            max="60"
            value={minAltitude}
            onChange={(e) => setMinAltitude(Number(e.target.value))}
          />
          <span>{minAltitude}°</span>
        </div>

        <button 
          onClick={() => findOptimalTimes(selectedDate)}
          disabled={isLoading}
          className="refresh-button"
        >
          {isLoading ? 'Calculating...' : 'Refresh'}
        </button>
      </div>

      <div className="results">
        {isLoading ? (
          <div className="loading">Calculating optimal photography times...</div>
        ) : (
          <div className="events-list">
            <h2>Optimal Photography Times</h2>
            {optimalEvents.length === 0 ? (
              <p>No optimal times found for the selected period. Try adjusting your criteria.</p>
            ) : (
              optimalEvents.map((event, index) => (
                <div key={index} className={`event-card event-${event.type}`}>
                  <div className="event-header">
                    <h3>{formatDate(event.date)}</h3>
                    <span className={`event-type type-${event.type}`}>
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="event-details">
                    <p className="description">{event.description}</p>
                    <ul className="event-list">
                      {event.events.map((evt, evtIndex) => (
                        <li key={evtIndex}>{evt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>How to Use</h3>
        <ul>
          <li><strong>Optimal:</strong> Multiple favorable conditions align (moon + golden hour + low altitude)</li>
          <li><strong>Good:</strong> Some favorable conditions present (moon visible during sunset, good phase)</li>
          <li><strong>Fair:</strong> Basic conditions met (moon low in sky)</li>
          <li>Adjust the maximum altitude to find times when the moon is lower in the sky</li>
          <li>All times are calculated for Bristol, UK coordinates</li>
        </ul>
      </div>
    </div>
  );
};

export default MoonPhotographyApp;