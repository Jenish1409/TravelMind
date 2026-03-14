import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'

// Fix default leaflet icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Color sequence for different days
const DAY_COLORS = ['#6366f1', '#a855f7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899']

/**
 * Create a colored numbered marker for each day
 */
function createDayIcon(color, number) {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 11px;
        font-weight: bold;
        font-family: Inter, sans-serif;
        display: block;
        text-align: center;
        line-height: 26px;
      ">${number}</span>
    </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })
}

export default function MapView() {
  const [itinerary, setItinerary] = useState(null)
  const [selectedDay, setSelectedDay] = useState('all')
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]) // India center

  useEffect(() => {
    const stored = sessionStorage.getItem('currentItinerary')
    if (stored) {
      const data = JSON.parse(stored)
      setItinerary(data)

      // Center map on first place with valid coords
      for (const day of data.itinerary || []) {
        for (const place of day.places || []) {
          if (place.coordinates?.lat && place.coordinates?.lng) {
            setMapCenter([place.coordinates.lat, place.coordinates.lng])
            return
          }
        }
      }
    }
  }, [])

  if (!itinerary) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-white mb-3">No itinerary to display</h2>
          <p className="text-gray-400 mb-6">Generate a trip plan to visualize it on the map.</p>
          <Link to="/plan" className="btn-primary">Plan a Trip →</Link>
        </div>
      </div>
    )
  }

  // Flatten and filter places by selected day
  const allPlacesWithDay = (itinerary.itinerary || []).flatMap((day, dayIdx) =>
    (day.places || []).map((place, pi) => ({
      ...place,
      dayNumber: day.day,
      dayIdx,
      placeIndex: pi,
      color: DAY_COLORS[dayIdx % DAY_COLORS.length],
      dayTheme: day.theme,
    }))
  )

  const filteredPlaces = selectedDay === 'all'
    ? allPlacesWithDay
    : allPlacesWithDay.filter((p) => p.dayNumber === parseInt(selectedDay))

  const placesWithCoords = filteredPlaces.filter((p) => p.coordinates?.lat && p.coordinates?.lng)

  // Build route lines per day
  const dayRoutes = (itinerary.itinerary || []).reduce((acc, day, dayIdx) => {
    if (selectedDay !== 'all' && day.day !== parseInt(selectedDay)) return acc
    const coords = (day.places || [])
      .filter((p) => p.coordinates?.lat && p.coordinates?.lng)
      .map((p) => [p.coordinates.lat, p.coordinates.lng])
    if (coords.length > 1) {
      acc.push({ coords, color: DAY_COLORS[dayIdx % DAY_COLORS.length], day: day.day })
    }
    return acc
  }, [])

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">
            {itinerary.destination} – Map View
          </h1>
          <p className="text-gray-500 text-sm">{placesWithCoords.length} places on map</p>
        </div>

        {/* Day filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all flex-shrink-0 ${
              selectedDay === 'all'
                ? 'bg-brand-500/20 border-brand-400/30 text-brand-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
          >
            All Days
          </button>
          {(itinerary.itinerary || []).map((day, dayIdx) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(String(day.day))}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all flex-shrink-0 ${
                selectedDay === String(day.day)
                  ? 'text-white border-transparent'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
              style={selectedDay === String(day.day) ? { backgroundColor: `${DAY_COLORS[dayIdx % DAY_COLORS.length]}30`, borderColor: DAY_COLORS[dayIdx % DAY_COLORS.length] + '60', color: DAY_COLORS[dayIdx % DAY_COLORS.length] } : {}}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        <Link to="/itinerary" className="btn-ghost text-sm py-2 px-4 flex-shrink-0">
          ← Itinerary
        </Link>
      </div>

      {/* Main layout: map + sidebar */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 136px)' }}>
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route polylines */}
            {dayRoutes.map((route) => (
              <Polyline
                key={`route-${route.day}`}
                positions={route.coords}
                pathOptions={{ color: route.color, weight: 3, opacity: 0.7, dashArray: '8, 6' }}
              />
            ))}

            {/* Place markers */}
            {placesWithCoords.map((place, idx) => (
              <Marker
                key={`${place.dayNumber}-${place.placeIndex}-${idx}`}
                position={[place.coordinates.lat, place.coordinates.lng]}
                icon={createDayIcon(place.color, place.placeIndex + 1)}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '200px' }}>
                    <div style={{ background: place.color, color: 'white', padding: '8px 12px', borderRadius: '6px 6px 0 0', margin: '-14px -19px 10px', fontSize: '12px', fontWeight: '600' }}>
                      Day {place.dayNumber}: {place.dayTheme}
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                      {place.name}
                    </h3>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                      {place.description}
                    </p>
                    {place.duration && (
                      <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>⏱ {place.duration}</p>
                    )}
                    {place.tips && (
                      <p style={{ margin: '6px 0 0', padding: '6px 8px', background: '#fffbeb', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                        💡 {place.tips}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar: place list */}
        <div className="w-72 hidden lg:flex flex-col bg-gray-950 border-l border-white/10 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-sm">Places</h2>
            <p className="text-gray-500 text-xs mt-0.5">{placesWithCoords.length} mapped · {filteredPlaces.length - placesWithCoords.length} without coords</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {(itinerary.itinerary || []).map((day, dayIdx) => {
              if (selectedDay !== 'all' && day.day !== parseInt(selectedDay)) return null
              const color = DAY_COLORS[dayIdx % DAY_COLORS.length]
              return (
                <div key={day.day}>
                  <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2" style={{ backgroundColor: `${color}15` }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                      {day.day}
                    </div>
                    <span className="text-xs font-medium" style={{ color }}>{day.theme || `Day ${day.day}`}</span>
                  </div>
                  {(day.places || []).map((place, pi) => (
                    <div key={pi} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                          {pi + 1}
                        </span>
                        <div>
                          <p className="text-white text-sm font-medium">{place.name}</p>
                          {place.coordinates ? (
                            <p className="text-gray-600 text-xs mt-0.5">📍 On map</p>
                          ) : (
                            <p className="text-gray-700 text-xs mt-0.5">No coordinates</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
