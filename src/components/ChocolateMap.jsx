// src/components/ChocolateMap.jsx
import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { getMajorOrigins } from '../data/originCoordinates';
import './ChocolateMap.css';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const majorOrigins = getMajorOrigins();
const TOTAL_MAJOR = majorOrigins.length;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

function ChocolateMap({ countries = [] }) {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(null);
  const [position, setPosition] = useState({ coordinates: [10, 5], zoom: 1 });

  const exploredLabels = new Set(countries.map(c => c.label));
  const exploredCount = countries.length;
  const ghostMarkers = majorOrigins.filter(o => !exploredLabels.has(o.label));

  const handleMarkerClick = (label) => {
    navigate(`/browse?origin=${encodeURIComponent(label)}`);
  };

  const handleMoveEnd = useCallback((pos) => {
    setPosition(pos);
  }, []);

  const handleZoomIn = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.min(pos.zoom * 1.5, MAX_ZOOM)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.max(pos.zoom / 1.5, MIN_ZOOM)
    }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [10, 5], zoom: 1 });
  }, []);

  const progressPct = TOTAL_MAJOR > 0
    ? Math.round((exploredCount / TOTAL_MAJOR) * 100)
    : 0;

  return (
    <div className="choc-map">
      {/* Progress */}
      <div className="choc-map-progress">
        <p className="choc-map-progress-text">
          You've explored <strong>{exploredCount}</strong> of {TOTAL_MAJOR} cacao-producing countries
        </p>
        <div className="choc-map-bar-track">
          <div
            className="choc-map-bar-fill"
            style={{ width: `${Math.max(progressPct, exploredCount > 0 ? 4 : 0)}%` }}
          />
        </div>
      </div>

      {/* Map */}
      <div
        className="choc-map-wrapper"
        onMouseLeave={() => setTooltip(null)}
      >
        {tooltip && (
          <div
            className="choc-map-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div>{tooltip.label}</div>
            {tooltip.count > 0 ? (
              <div className="choc-map-tooltip-count">
                {tooltip.count} {tooltip.count === 1 ? 'review' : 'reviews'}
              </div>
            ) : (
              <div className="choc-map-tooltip-discover">Tap to discover</div>
            )}
          </div>
        )}

        {/* Zoom controls */}
        <div className="choc-map-controls">
          <button
            className="choc-map-ctrl-btn"
            onClick={handleZoomIn}
            disabled={position.zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            className="choc-map-ctrl-btn"
            onClick={handleZoomOut}
            disabled={position.zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {position.zoom > 1.1 && (
            <button
              className="choc-map-ctrl-btn choc-map-ctrl-reset"
              onClick={handleReset}
              aria-label="Reset zoom"
              title="Reset view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          )}
        </div>

        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 160, center: [10, 5] }}
          className="choc-map-svg"
          width={800}
          height={450}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={handleMoveEnd}
          >
            {/* Cacao belt band (23.5°N to 23.5°S) */}
            <rect x={-200} y={148} width={1200} height={155} className="choc-map-cacao-belt" />

            {/* Country geographies */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="choc-map-geo"
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Ghost markers (unexplored major origins) */}
            {ghostMarkers.map((origin) => (
              <Marker
                key={`ghost-${origin.label}`}
                coordinates={origin.coords}
                onClick={() => handleMarkerClick(origin.label)}
                onMouseEnter={(e) => {
                  const rect = e.target.closest('.choc-map-wrapper').getBoundingClientRect();
                  const circle = e.target.getBoundingClientRect();
                  setTooltip({
                    label: origin.label,
                    count: 0,
                    x: circle.left + circle.width / 2 - rect.left,
                    y: circle.top - rect.top,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle r={4} className="choc-map-ghost" />
              </Marker>
            ))}

            {/* Explored markers with pulse */}
            {countries.map((country, i) => (
              <Marker
                key={country.label}
                coordinates={country.coords}
                onClick={() => handleMarkerClick(country.label)}
                onMouseEnter={(e) => {
                  const rect = e.target.closest('.choc-map-wrapper').getBoundingClientRect();
                  const circle = e.target.getBoundingClientRect();
                  setTooltip({
                    label: country.label,
                    count: country.count,
                    x: circle.left + circle.width / 2 - rect.left,
                    y: circle.top - rect.top,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Pulse ring */}
                <circle
                  r={8}
                  className="choc-map-pulse"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                {/* Dot */}
                <circle
                  r={Math.min(4 + country.count, 8)}
                  className="choc-map-dot choc-map-dot-animated"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="choc-map-legend">
        <div className="choc-map-legend-item">
          <span className="choc-map-legend-dot explored" />
          Explored
        </div>
        <div className="choc-map-legend-item">
          <span className="choc-map-legend-dot unexplored" />
          Yet to discover
        </div>
      </div>
    </div>
  );
}

export default memo(ChocolateMap);
