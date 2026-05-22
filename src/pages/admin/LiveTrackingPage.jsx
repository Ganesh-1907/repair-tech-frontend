import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { staffManagementService } from '../../services/staffManagementService';

const INDIA_CENTER = [20.5937, 78.9629];
const REFRESH_INTERVAL_MS = 30 * 1000;

const makeMarkerIcon = (color, label = '') => L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:${color};border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${label}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const waypointIcon = (index) => L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#2563eb;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);">${index}</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

const formatRelativeTime = (value) => {
  if (!value) return 'No data';
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr ago`;
};

const formatTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatTrackDate = (value) => {
  if (!value) return '-';
  const [y, m, day] = value.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const buildCalendarDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

const CALENDAR_DAYS = buildCalendarDays();

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

const MapBoundsFitter = ({ positions }) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (positions.length > 0 && !fitted.current) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 15 });
      fitted.current = true;
    }
  }, [map, positions]);
  return null;
};

const PanTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [map, lat, lng]);
  return null;
};

const LiveTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const staffIdFromUrl = searchParams.get('staffId') || '';
  const [staffData, setStaffData] = useState([]);
  const [selectedId, setSelectedId] = useState(staffIdFromUrl || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [panTarget, setPanTarget] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const panSequenceRef = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const data = await staffManagementService.getLiveLocations();
      setStaffData(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load location data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const firstLoad = setTimeout(fetchData, 0);
    const timer = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => {
      clearTimeout(firstLoad);
      clearInterval(timer);
    };
  }, [fetchData]);

  useEffect(() => {
    let mounted = true;
    if (!selectedId) {
      return () => {
        mounted = false;
      };
    }

    const loadHistory = setTimeout(() => {
      setHistoryLoading(true);
      setHistoryError('');
      staffManagementService.getStaffLocationHistory(selectedId)
        .then((data) => {
          if (!mounted) return;
          setHistory(data);
          setSelectedDate(data.datesWithData?.[0] || null);
        })
        .catch((err) => {
          if (!mounted) return;
          setHistory(null);
          setSelectedDate(null);
          setHistoryError(err.response?.data?.message || err.message || 'Failed to load location history.');
        })
        .finally(() => {
          if (mounted) setHistoryLoading(false);
        });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(loadHistory);
    };
  }, [selectedId]);

  const selected = staffData.find((s) => s.staffId === selectedId) || null;

  const handleSelectStaff = (s) => {
    setSelectedId(s.staffId);
    setSearchParams({ staffId: s.staffId });
    if (s.lastLat != null && s.lastLng != null) {
      panSequenceRef.current += 1;
      setPanTarget({ lat: s.lastLat, lng: s.lastLng, key: panSequenceRef.current });
    }
  };

  const activeCount = staffData.filter((s) => s.attendanceStatus === 'Present').length;
  const clockedOutCount = staffData.filter((s) => s.attendanceStatus === 'Clocked Out').length;

  const allPositions = staffData
    .filter((s) => s.lastLat != null && s.lastLng != null)
    .map((s) => [s.lastLat, s.lastLng]);

  const selectedRoute = selected?.route?.filter((p) => p.lat != null && p.lng != null) || [];
  const routePositions = selectedRoute.map((p) => [p.lat, p.lng]);
  const historyRoute = selectedDate ? (history?.history?.[selectedDate]?.route || []) : [];
  const historyPositions = historyRoute.filter((p) => p.lat != null && p.lng != null).map((p) => [p.lat, p.lng]);
  const selectedName = selected?.staffName || history?.staffName || selectedId || 'Selected Staff';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AdminPageHeader
        title="Staff Live Tracking"
        description="See where staff are during their shift. Updates every 30 seconds."
        breadcrumbs={['Staff Management', 'Live Tracking']}
        actions={[
          {
            label: lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : 'Loading…',
            onClick: fetchData,
            icon: 'RefreshCw',
            variant: 'secondary',
          },
        ]}
      />

      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          {activeCount} Active
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6b7280', display: 'inline-block' }} />
          {clockedOutCount} Clocked Out
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-sub, #6b7280)' }}>
          <Users size={14} /> {staffData.length} total clocked in today
        </span>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', color: '#dc2626', background: '#fef2f2' }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', minHeight: '560px' }}>
        {/* Staff list */}
        <div className="card" style={{ padding: 0, overflowY: 'auto', maxHeight: '600px' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border, #e5e7eb)', fontWeight: 700, fontSize: '13px', color: 'var(--text-sub, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Staff ({staffData.length})
          </div>

          {loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-sub, #6b7280)', fontSize: '14px' }}>
              Loading…
            </div>
          )}

          {!loading && staffData.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-sub, #6b7280)', fontSize: '14px' }}>
              No staff clocked in today.
            </div>
          )}

          {staffData.map((s) => {
            const isActive = s.attendanceStatus === 'Present';
            const isSelected = s.staffId === selectedId;
            const hasLocation = s.lastLat != null && s.lastLng != null;
            return (
              <button
                key={s.staffId}
                type="button"
                onClick={() => handleSelectStaff(s)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: isSelected ? 'var(--bg-accent, #eff6ff)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid var(--border, #f3f4f6)',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? '#dcfce7' : '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, color: isActive ? '#16a34a' : '#6b7280',
                }}>
                  {initials(s.staffName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main, #111)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.staffName}
                  </div>
                  <div style={{ fontSize: '11px', color: isActive ? '#16a34a' : '#6b7280', marginTop: 2 }}>
                    {isActive ? 'Active' : 'Clocked Out'}{' '}
                    {hasLocation ? `· ${formatRelativeTime(s.lastSeenAt)}` : '· No GPS'}
                  </div>
                </div>
                {hasLocation && (
                  <MapPin size={14} style={{ color: isActive ? '#2563eb' : '#9ca3af', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          {selected && (
            <div style={{
              position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1000, background: '#fff', borderRadius: 8, padding: '6px 14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.attendanceStatus === 'Present' ? '#16a34a' : '#6b7280', display: 'inline-block' }} />
              {selected.staffName} — {selectedRoute.length} location{selectedRoute.length !== 1 ? 's' : ''} tracked
            </div>
          )}

          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            style={{ height: '100%', minHeight: 560, width: '100%' }}
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {allPositions.length > 0 && !selectedId && (
              <MapBoundsFitter positions={allPositions} />
            )}

            {panTarget && (
              <PanTo key={panTarget.key} lat={panTarget.lat} lng={panTarget.lng} />
            )}

            {/* All staff latest-position markers */}
            {staffData.map((s) => {
              if (s.lastLat == null || s.lastLng == null) return null;
              const isActive = s.attendanceStatus === 'Present';
              const color = isActive ? '#16a34a' : '#6b7280';
              const icon = makeMarkerIcon(color, initials(s.staffName));
              return (
                <Marker key={s.staffId} position={[s.lastLat, s.lastLng]} icon={icon}>
                  <Popup>
                    <strong>{s.staffName}</strong><br />
                    Status: {s.attendanceStatus}<br />
                    Clock In: {formatTime(s.clockInTime)}<br />
                    {s.clockOutTime && <>Clock Out: {formatTime(s.clockOutTime)}<br /></>}
                    Last seen: {formatRelativeTime(s.lastSeenAt)}
                  </Popup>
                </Marker>
              );
            })}

            {/* Selected staff route */}
            {selected && routePositions.length > 1 && (
              <Polyline positions={routePositions} color="#2563eb" weight={3} opacity={0.8} />
            )}

            {/* Selected staff waypoints */}
            {selected && selectedRoute.map((point, i) => (
              <Marker
                key={`${selected.staffId}-wp-${i}`}
                position={[point.lat, point.lng]}
                icon={waypointIcon(i + 1)}
              >
                <Popup>
                  Stop {i + 1}<br />
                  {point.source === 'clock-in' ? 'Clock-In location' : point.source === 'clock-out' ? 'Clock-Out location' : 'Location ping'}<br />
                  Time: {formatTime(point.loggedAt)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {!loading && staffData.every((s) => s.lastLat == null) && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.85)', zIndex: 999, flexDirection: 'column', gap: 12,
            }}>
              <MapPin size={40} style={{ color: '#9ca3af' }} />
              <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
                No GPS data yet. Staff will appear once they share their location.
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>{selected.staffName} — Today's Route</h3>
          {selectedRoute.length === 0 ? (
            <p style={{ color: 'var(--text-sub, #6b7280)', fontSize: 14 }}>No location data recorded for this staff today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedRoute.map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ color: 'var(--text-sub, #6b7280)', minWidth: 80 }}>{formatTime(point.loggedAt)}</span>
                  <span style={{ fontWeight: 500 }}>
                    {point.source === 'clock-in' ? 'Clocked In' : point.source === 'clock-out' ? 'Clocked Out' : 'Location Update'}
                  </span>
                  <span style={{ color: 'var(--text-sub, #6b7280)' }}>
                    {point.lat?.toFixed(5)}, {point.lng?.toFixed(5)}
                    {point.accuracy ? ` (±${Math.round(point.accuracy)}m)` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border, #e5e7eb)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} style={{ color: '#2563eb' }} />
                Location History — {selectedName}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub, #6b7280)' }}>
                Last 30 days · {history ? `${history.datesWithData?.length || 0} day(s) with GPS data` : 'Loading history'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-sub, #6b7280)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Start
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} /> End
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} /> Ping
              </span>
            </div>
          </div>

          {historyLoading && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-sub, #6b7280)' }}>
              Loading location calendar…
            </div>
          )}

          {historyError && (
            <div style={{ margin: 20, padding: 16, color: '#dc2626', background: '#fef2f2', borderRadius: 8 }}>{historyError}</div>
          )}

          {!historyLoading && history && (
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'minmax(260px, 360px) 1fr', gap: 20 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Select a date
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: 6 }}>
                  {CALENDAR_DAYS.map((dateStr) => {
                    const hasData = Boolean(history.history?.[dateStr]);
                    const isSelected = selectedDate === dateStr;
                    const [, , d] = dateStr.split('-');
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={!hasData}
                        onClick={() => setSelectedDate(dateStr)}
                        title={hasData ? `${formatTrackDate(dateStr)} - ${history.history[dateStr].count} location(s)` : formatTrackDate(dateStr)}
                        style={{
                          minHeight: 56,
                          padding: '6px 4px',
                          border: `1.5px solid ${isSelected ? '#2563eb' : hasData ? '#93c5fd' : '#e5e7eb'}`,
                          borderRadius: 8,
                          background: isSelected ? '#2563eb' : hasData ? '#eff6ff' : '#f9fafb',
                          color: isSelected ? '#fff' : hasData ? '#1d4ed8' : '#9ca3af',
                          cursor: hasData ? 'pointer' : 'not-allowed',
                          fontSize: 12,
                          fontWeight: hasData ? 700 : 400,
                          textAlign: 'center',
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                          {new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: 16 }}>{d}</div>
                        {hasData && !isSelected && (
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', margin: '2px auto 0' }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 18, padding: 14, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-sub, #6b7280)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                    Progress
                  </div>
                  {selectedDate ? (
                    <>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{historyRoute.length} points</div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub, #6b7280)' }}>{formatTrackDate(selectedDate)}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-sub, #6b7280)' }}>
                      {history.datesWithData?.length ? 'Choose a highlighted date.' : 'No location data in the last 30 days.'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {!selectedDate && (
                  <div style={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub, #6b7280)', background: '#f9fafb', borderRadius: 8 }}>
                    {history.datesWithData?.length === 0 ? 'No location data recorded for this staff in the last 30 days.' : 'Select a highlighted date to view route progress.'}
                  </div>
                )}

                {selectedDate && historyPositions.length === 0 && (
                  <div style={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub, #6b7280)', background: '#f9fafb', borderRadius: 8 }}>
                    No GPS coordinates recorded for this date.
                  </div>
                )}

                {selectedDate && historyPositions.length > 0 && (
                  <>
                    <div style={{ height: 420, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 16 }}>
                      <MapContainer
                        key={`${selectedId}-${selectedDate}`}
                        center={historyPositions[historyPositions.length - 1]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {historyPositions.length > 1 && (
                          <Polyline positions={historyPositions} color="#2563eb" weight={3} opacity={0.85} />
                        )}
                        <MapBoundsFitter positions={historyPositions} />
                        {historyRoute.map((point, i) => {
                          if (point.lat == null || point.lng == null) return null;
                          const isFirst = i === 0;
                          const isLast = i === historyRoute.length - 1;
                          const icon = makeMarkerIcon(isFirst ? '#16a34a' : isLast ? '#dc2626' : '#2563eb', String(i + 1));
                          return (
                            <Marker key={`${point.loggedAt}-${i}`} position={[point.lat, point.lng]} icon={icon}>
                              <Popup>
                                {isFirst ? 'Start' : isLast ? 'End' : `Point ${i + 1}`}<br />
                                {point.source === 'clock-in' ? 'Clock-In' : point.source === 'clock-out' ? 'Clock-Out' : 'Location Ping'}<br />
                                Time: {formatTime(point.loggedAt)}
                                {point.accuracy ? <><br />Accuracy: {Math.round(point.accuracy)}m</> : null}
                              </Popup>
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                            <th style={{ padding: '8px 10px', fontWeight: 700 }}>#</th>
                            <th style={{ padding: '8px 10px', fontWeight: 700 }}>Time</th>
                            <th style={{ padding: '8px 10px', fontWeight: 700 }}>Progress</th>
                            <th style={{ padding: '8px 10px', fontWeight: 700 }}>Coordinates</th>
                            <th style={{ padding: '8px 10px', fontWeight: 700 }}>Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyRoute.map((point, i) => (
                            <tr key={`${point.loggedAt}-row-${i}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '8px 10px', color: '#6b7280' }}>{i + 1}</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{formatTime(point.loggedAt)}</td>
                              <td style={{ padding: '8px 10px', color: point.source === 'clock-in' ? '#16a34a' : point.source === 'clock-out' ? '#dc2626' : '#2563eb', fontWeight: 600 }}>
                                {point.source === 'clock-in' ? 'Clock-In' : point.source === 'clock-out' ? 'Clock-Out' : 'Location Ping'}
                              </td>
                              <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>
                                {point.lat?.toFixed(5)}, {point.lng?.toFixed(5)}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                                {point.accuracy ? `${Math.round(point.accuracy)}m` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTrackingPage;
