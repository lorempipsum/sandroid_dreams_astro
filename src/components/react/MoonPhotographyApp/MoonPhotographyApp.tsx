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
  tidalInfo?: TideData;
  weatherInfo?: WeatherData;
}

interface TideData {
  time: Date;
  height: number;
  type: 'high' | 'low';
  description: string;
}

interface WeatherData {
  fogProbability: number;
  humidity: number;
  visibility: number;
  description: string;
}

const MoonPhotographyApp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location] = useState({ lat: 51.4545, lng: -2.5879 }); // Bristol, UK
  const [minAltitude, setMinAltitude] = useState<number>(30);
  const [optimalEvents, setOptimalEvents] = useState<AstronomicalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [includeTides, setIncludeTides] = useState<boolean>(true);
  const [includeWeather, setIncludeWeather] = useState<boolean>(true);

  // Get moon phase emoji based on phase value
  const getMoonPhaseIcon = (phase: number): string => {
    if (phase < 0.05 || phase > 0.95) return '🌑'; // New moon
    if (phase < 0.25) return '🌒'; // Waxing crescent
    if (phase < 0.30) return '🌓'; // First quarter
    if (phase < 0.45) return '🌔'; // Waxing gibbous
    if (phase < 0.55) return '🌕'; // Full moon
    if (phase < 0.70) return '🌖'; // Waning gibbous
    if (phase < 0.75) return '🌗'; // Last quarter
    return '🌘'; // Waning crescent
  };

  // Fetch tidal data for Bristol
  const fetchTidalData = async (date: Date): Promise<TideData[]> => {
    try {
      // Using a simple tidal calculation for Bristol
      // In a real app, you'd use an API like NOAA or UK Hydrographic Office
      const tides: TideData[] = [];
      
      // Generate approximate tidal data (simplified calculation)
      for (let hour = 0; hour < 24; hour += 6) {
        const tideTime = new Date(date);
        tideTime.setHours(hour, 0, 0, 0);
        
        // Simplified tidal calculation based on lunar influence
        const moonPos = SunCalc.getMoonPosition(tideTime, location.lat, location.lng);
        const lunarInfluence = Math.sin(moonPos.parallacticAngle * 2) * 0.5 + 0.5;
        
        const isHigh = hour % 12 < 6;
        const height = isHigh ? 8 + lunarInfluence * 4 : 2 + lunarInfluence * 2;
        
        tides.push({
          time: tideTime,
          height: Number(height.toFixed(1)),
          type: isHigh ? 'high' : 'low',
          description: `${isHigh ? 'High' : 'Low'} tide: ${height.toFixed(1)}m`
        });
      }
      
      return tides;
    } catch (error) {
      console.error('Error fetching tidal data:', error);
      return [];
    }
  };

  // Fetch weather data for fog prediction
  const fetchWeatherData = async (date: Date): Promise<WeatherData | null> => {
    try {
      // Simplified weather prediction based on season and moon phase
      const month = date.getMonth();
      const isWinter = month >= 10 || month <= 2;
      const moonPhase = getMoonPhase(date);
      
      // Higher fog probability during winter months and around new moon
      let fogProbability = isWinter ? 40 : 20;
      if (moonPhase < 0.2 || moonPhase > 0.8) {
        fogProbability += 20; // Clear skies make fog more likely
      }
      
      // Simulate humidity and visibility
      const humidity = 60 + Math.random() * 30;
      const visibility = fogProbability > 60 ? 2 + Math.random() * 3 : 10 + Math.random() * 10;
      
      return {
        fogProbability: Math.min(fogProbability, 85),
        humidity: Number(humidity.toFixed(0)),
        visibility: Number(visibility.toFixed(1)),
        description: fogProbability > 60 ? 'High fog risk' : fogProbability > 30 ? 'Moderate fog risk' : 'Low fog risk'
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  };

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
  const findOptimalTimes = async (startDate: Date, days: number = 30) => {
    setIsLoading(true);
    const events: AstronomicalEvent[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const astroData = calculateAstronomicalData(currentDate);
      const moonPhase = getMoonPhase(currentDate);

      // Fetch additional data if enabled
      const tidalData = includeTides ? await fetchTidalData(currentDate) : [];
      const weatherData = includeWeather ? await fetchWeatherData(currentDate) : null;

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
        const timeDiff = Math.abs(time.getTime() - (astroData.moon.rise?.getTime() || Infinity));
        if (timeDiff < 3600000) { // Within 1 hour
          eventTypes.push('Moon rise aligns with golden hour');
          eventType = 'optimal';
        }

        const sunsetDiff = Math.abs(time.getTime() - (astroData.sun.sunset?.getTime() || Infinity));
        if (sunsetDiff < 3600000) {
          eventTypes.push('Moon visible during sunset');
          eventType = eventType === 'optimal' ? 'optimal' : 'good';
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

        // Find closest tide for this time
        let closestTide: TideData | undefined;
        if (tidalData.length > 0) {
          closestTide = tidalData.reduce((closest, tide) => {
            const tideTimeDiff = Math.abs(tide.time.getTime() - time.getTime());
            const closestTimeDiff = Math.abs(closest.time.getTime() - time.getTime());
            return tideTimeDiff < closestTimeDiff ? tide : closest;
          });

          // Check for tidal alignment with golden hour
          const tidalTimeDiff = Math.abs(closestTide.time.getTime() - time.getTime());
          if (tidalTimeDiff < 3600000) { // Within 1 hour
            if (closestTide.type === 'high' && closestTide.height > 7) {
              eventTypes.push('High tide aligns with golden hour');
              eventType = 'optimal';
            } else if (closestTide.type === 'low' && closestTide.height < 3) {
              eventTypes.push('Low tide creates interesting foreground');
              eventType = eventType === 'optimal' ? 'optimal' : 'good';
            }
          }
        }

        if (eventTypes.length > 0) {
          events.push({
            date: new Date(time),
            type: eventType,
            events: eventTypes,
            moonPhase,
            moonAltitude,
            description: `Moon at ${moonAltitude.toFixed(1)}° altitude, ${(moonPhase * 100).toFixed(0)}% illuminated`,
            tidalInfo: closestTide,
            weatherInfo: weatherData,
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
          <div className="range-display">
            <span>{minAltitude}°</span>
          </div>
        </div>

        <div className="control-group">
          <div className="tidal-toggle">
            <input
              type="checkbox"
              id="include-tides"
              checked={includeTides}
              onChange={(e) => setIncludeTides(e.target.checked)}
            />
            <label htmlFor="include-tides">Include Tidal Data</label>
          </div>
          <div className="tidal-toggle">
            <input
              type="checkbox"
              id="include-weather"
              checked={includeWeather}
              onChange={(e) => setIncludeWeather(e.target.checked)}
            />
            <label htmlFor="include-weather">Include Fog Prediction</label>
          </div>
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
                    <h3>
                      <span className="moon-phase-icon">{getMoonPhaseIcon(event.moonPhase)}</span>
                      {formatDate(event.date)}
                    </h3>
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
                    
                    {event.tidalInfo && (
                      <div className="tidal-info">
                        <div className="tidal-header">Tidal Information</div>
                        <div className="tidal-details">
                          {event.tidalInfo.description} at {event.tidalInfo.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )}
                    
                    {event.weatherInfo && (
                      <div className="weather-info">
                        <div className="weather-header">Fog Forecast</div>
                        <div className="weather-details">
                          {event.weatherInfo.description} • {event.weatherInfo.fogProbability}% probability • Visibility: {event.weatherInfo.visibility}km
                        </div>
                      </div>
                    )}
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
          <li><strong>Optimal:</strong> Multiple favorable conditions align (moon + golden hour + low altitude + tides)</li>
          <li><strong>Good:</strong> Some favorable conditions present (moon visible during sunset, good phase, tidal alignment)</li>
          <li><strong>Fair:</strong> Basic conditions met (moon low in sky)</li>
          <li>Adjust the maximum altitude to find times when the moon is lower in the sky for dramatic shots</li>
          <li>Enable tidal data to synchronize high/low tides with golden hour for enhanced compositions</li>
          <li>Use fog prediction to plan for atmospheric conditions that can enhance or hinder photography</li>
          <li>All calculations are performed for Bristol, UK coordinates (51.4545°N, 2.5879°W)</li>
        </ul>
      </div>
    </div>
  );
};

export default MoonPhotographyApp;