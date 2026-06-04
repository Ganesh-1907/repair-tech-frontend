import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, MapPin } from 'lucide-react';
import { staffManagementService } from '../../services/staffManagementService';
import {
  formatAccuracyLabel,
  formatCoordinates,
  formatPointType,
  isLowAccuracyPoint,
  locationKeyForPoint,
  useLocationNames,
} from '../../utils/locationNames';

const makeMarkerIcon = (color, label = '') => L.divIcon({
  className: '',
  html: `<div style="width:26px;height:26px;background:${color};border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${label}</div>`,
  iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14],
});

const formatTime = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || isNaN(d)) return '-';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatTrackDate = (v) => {
  if (!v) return '-';
  const [y, m, day] = v.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const TODAY = isoToday();
const CUTOFF = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 39);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MapFit = ({ positions }) => {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (positions.length > 0 && !done.current) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 15 });
      done.current = true;
    }
  }, [map, positions]);
  return null;
};

const CalendarPicker = ({ history, selectedDate, onSelect }) => {
  const now = new Date();
  const [vy, setVy] = useState(now.getFullYear());
  const [vm, setVm] = useState(now.getMonth());
  const cutoff = new Date(CUTOFF + 'T12:00:00');
  const canPrev = vy > cutoff.getFullYear() || (vy === cutoff.getFullYear() && vm > cutoff.getMonth());
  const canNext = vy < now.getFullYear() || (vy === now.getFullYear() && vm < now.getMonth());
  const goPrev = () => { if (!canPrev) return; if (vm === 0) { setVy((y) => y - 1); setVm(11); } else setVm((m) => m - 1); };
  const goNext = () => { if (!canNext) return; if (vm === 11) { setVy((y) => y + 1); setVm(0); } else setVm((m) => m + 1); };
  const firstDow = new Date(vy, vm, 1).getDay();
  const dim = new Date(vy, vm + 1, 0).getDate();
  const rows = [];
  let cursor = 1 - firstDow;
  for (let r = 0; r < 6; r++) {
    const week = [];
    let any = false;
    for (let c = 0; c < 7; c++, cursor++) {
      if (cursor >= 1 && cursor <= dim) {
        const ds = `${vy}-${String(vm + 1).padStart(2, '0')}-${String(cursor).padStart(2, '0')}`;
        week.push({ n: cursor, ds });
        any = true;
      } else {
        week.push(null);
      }
    }
    if (any) rows.push(week);
  }
  const navBtn = (en) => ({ background: 'var(--bg-sub,#f3f4f6)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: en ? 'pointer' : 'default', fontSize: 18, color: en ? '#374151' : '#d1d5db', lineHeight: 1 });

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
        <button type="button" onClick={goPrev} style={navBtn(canPrev)}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 13, minWidth: 110, textAlign: 'center' }}>{MONTH_NAMES[vm]} {vy}</span>
        <button type="button" onClick={goNext} style={navBtn(canNext)}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {DAY_ABBR.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af' }}>{d}</div>)}
      </div>
      {rows.map((week, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 2 }}>
          {week.map((cell, ci) => {
            if (!cell) return <div key={ci} style={{ aspectRatio: '1/1' }} />;
            const { n, ds } = cell;
            const inRange = ds >= CUTOFF && ds <= TODAY;
            const isToday = ds === TODAY;
            const isSel = ds === selectedDate;
            const hasData = inRange && Boolean(history?.history?.[ds]);
            const isAbsent = inRange && !hasData;
            let bg, color, border;
            if (isSel || isToday) { bg = '#16a34a'; color = '#fff'; border = '#16a34a'; }
            else if (!inRange) { bg = 'transparent'; color = '#d1d5db'; border = 'transparent'; }
            else if (isAbsent) { bg = '#fef2f2'; color = '#dc2626'; border = '#fca5a5'; }
            else { bg = '#f0fdf4'; color = '#15803d'; border = '#bbf7d0'; }
            return (
              <button
                key={ci}
                type="button"
                onClick={() => { if (inRange) onSelect(ds); }}
                title={inRange ? (hasData ? `${formatTrackDate(ds)} — ${history.history[ds].count} pts` : `${formatTrackDate(ds)} — No data`) : ''}
                style={{ aspectRatio: '1/1', width: '100%', border: `1.5px solid ${border}`, borderRadius: 5, background: bg, color, fontSize: 11, fontWeight: 600, cursor: inRange ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {n}
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ marginTop: 8, display: 'flex', gap: 8, fontSize: 10, color: '#6b7280', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} /> Today/Selected</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'inline-block' }} /> Has Data</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#fef2f2', border: '1px solid #fca5a5', display: 'inline-block' }} /> No Data</span>
      </div>
    </div>
  );
};

const StaffIndividualTrackingPage = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [liveStaff, setLiveStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!staffId) return;
    Promise.all([
      staffManagementService.getLiveLocations(),
      staffManagementService.getStaffLocationHistory(staffId),
    ]).then(([live, hist]) => {
      setLiveStaff(live.find((s) => s.staffId === staffId) || null);
      setHistory(hist);
      setSelectedDate(TODAY);
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load tracking data.'))
      .finally(() => setLoading(false));
  }, [staffId]);

  const staffName = liveStaff?.staffName || history?.staffName || staffId;
  const isToday = selectedDate === TODAY;

  const allPoints = useMemo(() => {
    const source = (isToday
      ? liveStaff?.route
      : history?.history?.[selectedDate]?.route
    ) || [];

    return source
      .map((point) => ({ ...point, lat: Number(point.lat), lng: Number(point.lng) }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point, index) => ({
        ...point,
        sequence: index + 1,
        locationKey: locationKeyForPoint(point.lat, point.lng),
      }));
  }, [history?.history, isToday, liveStaff?.route, selectedDate]);
  const mapRoute = allPoints.filter((point) => !isLowAccuracyPoint(point));
  const positions = allPoints.map((point) => [point.lat, point.lng]);
  const reliablePositions = mapRoute.map((point) => [point.lat, point.lng]);
  const lowAccuracyCount = allPoints.length - mapRoute.length;
  const { namesByKey, isResolving } = useLocationNames(allPoints);

  const getPointPlaceLabel = (point) => {
    const hasResolved = Object.prototype.hasOwnProperty.call(namesByKey, point.locationKey);
    const resolvedName = namesByKey[point.locationKey];
    if (resolvedName) return resolvedName;
    if (!hasResolved && isResolving) return 'Resolving place name...';
    return `Place name unavailable - ${formatCoordinates(point)}`;
  };

  if (loading) {
    return <div className="admin-module-page"><div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading tracking data…</div></div>;
  }

  return (
    <div className="admin-module-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{staffName} — Location Tracking</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Today's route and 40-day location history</p>
        </div>
        {liveStaff && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, background: liveStaff.attendanceStatus === 'Present' ? '#dcfce7' : '#f3f4f6', color: liveStaff.attendanceStatus === 'Present' ? '#16a34a' : '#6b7280' }}>
            ● {liveStaff.attendanceStatus || 'Offline'}
          </span>
        )}
      </div>

      {error && <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 8 }}>{error}</div>}

      {/* Movement points left, Calendar right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Movement points */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{isToday ? "Today's Movement Points" : formatTrackDate(selectedDate)}</span>
              <span style={{ marginLeft: 10, fontSize: 12, color: '#6b7280' }}>
                {allPoints.length} location ping{allPoints.length !== 1 ? 's' : ''}
              </span>
              {lowAccuracyCount > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '2px 7px', borderRadius: 4 }}>
                  {lowAccuracyCount} low-accuracy ping{lowAccuracyCount > 1 ? 's' : ''} marked No GPS
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280' }}>
              <span><span style={{ color: '#16a34a' }}>●</span> Start</span>
              <span><span style={{ color: '#dc2626' }}>●</span> End</span>
              <span><span style={{ color: '#2563eb' }}>●</span> Ping</span>
              <span><span style={{ color: '#d97706' }}>●</span> No GPS</span>
            </div>
          </div>

          {allPoints.length > 0 ? (
            <div style={{ maxHeight: 430, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allPoints.map((point, index) => {
                const isFirst = index === 0;
                const isLast = index === allPoints.length - 1;
                const isLowAccuracy = isLowAccuracyPoint(point);
                const markerColor = isLowAccuracy ? '#d97706' : isFirst ? '#16a34a' : isLast ? '#dc2626' : '#2563eb';
                return (
                  <div
                    key={`${point.loggedAt}-${point.sequence}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '34px minmax(0, 1fr)',
                      gap: 12,
                      alignItems: 'start',
                      padding: '12px',
                      border: `1px solid ${isLowAccuracy ? '#fde68a' : '#e5e7eb'}`,
                      borderRadius: 8,
                      background: isLowAccuracy ? '#fffbeb' : '#fff',
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: markerColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                      {point.sequence}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>{formatTime(point.loggedAt)}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isFirst ? '#16a34a' : isLast ? '#dc2626' : '#2563eb' }}>
                          {isFirst ? 'Start' : isLast ? 'End' : formatPointType(point.source)}
                        </span>
                        <span style={{ fontSize: 11, color: isLowAccuracy ? '#92400e' : '#16a34a', fontWeight: 700 }}>
                          {formatAccuracyLabel(point.accuracy)}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                        {getPointPlaceLabel(point)}
                      </div>
                      <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>
                        {formatCoordinates(point)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 10 }}>
              <MapPin size={36} />
              <span style={{ fontSize: 14 }}>{isToday ? 'No location pings recorded for today.' : 'No location pings for this date.'}</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e5e7eb', background: '#f8fafc' }}>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Map Preview</span>
                <span style={{ marginLeft: 8, fontSize: 11, color: '#6b7280' }}>
                  All numbered pings shown; route line uses {reliablePositions.length} reliable GPS point{reliablePositions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {positions.length > 0 ? (
              <MapContainer key={`${staffId}-${selectedDate}`} center={positions[0]} zoom={13} style={{ height: 280, width: '100%' }}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {reliablePositions.length > 1 && <Polyline positions={reliablePositions} color="#2563eb" weight={3} opacity={0.85} />}
                <MapFit positions={positions} />
                {allPoints.map((point, index) => {
                  const isFirst = index === 0;
                  const isLast = index === allPoints.length - 1;
                  const isLowAccuracy = isLowAccuracyPoint(point);
                  const icon = makeMarkerIcon(isLowAccuracy ? '#d97706' : isFirst ? '#16a34a' : isLast ? '#dc2626' : '#2563eb', String(point.sequence));
                  return (
                    <Marker key={`${point.loggedAt}-map-${point.sequence}`} position={[point.lat, point.lng]} icon={icon}>
                      <Popup>
                        Point {point.sequence}: {isFirst ? 'Start' : isLast ? 'End' : formatPointType(point.source)}<br />
                        {getPointPlaceLabel(point)}<br />
                        Time: {formatTime(point.loggedAt)}<br />
                        Accuracy: {formatAccuracyLabel(point.accuracy)}
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
                No coordinates to preview.
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Select Date</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Last 40 days · {history?.datesWithData?.length || 0} day(s) with data</div>
          <CalendarPicker history={history} selectedDate={selectedDate} onSelect={setSelectedDate} />
          {selectedDate && (
            <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Selected</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{allPoints.length} pings</div>
              <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>{reliablePositions.length} reliable GPS</div>
              {lowAccuracyCount > 0 && <div style={{ fontSize: 12, color: '#92400e', fontWeight: 700 }}>{lowAccuracyCount} No GPS</div>}
              <div style={{ fontSize: 12, color: '#6b7280' }}>{formatTrackDate(selectedDate)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffIndividualTrackingPage;
