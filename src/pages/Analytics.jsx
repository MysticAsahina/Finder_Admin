import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  ArcElement,
  Title, Tooltip, Legend, Filler
)

const lineData = {
  labels: ['1','3','5','7','9','11','14','18','21','23','27','30'],
  datasets: [{
    label: 'Trips',
    data: [96,112,104,115,110,106,118,114,116,122,108,114],
    borderColor: '#fa7528',
    backgroundColor: 'rgba(250,117,40,0.1)',
    fill: true,
    tension: 0.4,
    borderWidth: 4,
    pointRadius: 6,
    pointBackgroundColor: '#fa7528',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
  }],
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: false, min: 70, max: 140, grid: { color: '#f5ede8', drawBorder: false }, ticks: { stepSize: 10, font: { weight: 500 } } },
    x: { grid: { display: false }, ticks: { font: { weight: 600 } } },
  },
}

const peakData = {
  labels: ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'],
  datasets: [{
    label: 'Trips',
    data: [8,24,35,18,16,12,22,14,10,17,27,32],
    backgroundColor: '#fa7528',
    borderRadius: 6,
    barThickness: 28,
  }],
}

const peakOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, max: 35, grid: { color: '#f5ede8', drawBorder: false } },
    x: { grid: { display: false } },
  },
}

const donutData = {
  labels: ['Completed', 'Cancelled'],
  datasets: [{
    data: [88, 12],
    backgroundColor: ['#fa7528', '#fca5a5'],
    borderWidth: 0,
    cutout: '70%',
  }],
}

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
}

const topDrivers = [
  { name:'Marco Santos', trips:48, rate:'96%', status:'online', statusClass:'green' },
  { name:'Pedro Dela Cruz', trips:43, rate:'91%', status:'online', statusClass:'green' },
  { name:'Jose Rivera', trips:37, rate:'89%', status:'online', statusClass:'green' },
  { name:'Marcelino Zafra', trips:34, rate:'94%', status:'online', statusClass:'green' },
  { name:'Michael Reyes', trips:29, rate:'97%', status:'offline', statusClass:'red' },
  { name:'Luis Gomez', trips:23, rate:'87%', status:'online', statusClass:'green' },
  { name:'Ramon Flores', trips:19, rate:'93%', status:'inactive', statusClass:'yellow' },
]

export default function Analytics() {
  return (
    <div>
      <div className="stat-grid" style={{ marginBottom:28 }}>
        {[
          { label:"THIS WEEK'S TRIPS", val:'847', trend:'↑ 14% vs last week', trendClass:'up' },
          { label:'COMPLETION RATE', val:'88%', valClass:'green', trend:'↑ 2% improvement', trendClass:'up' },
          { label:'AVG DAILY TRIP', val:'121', trend:'↑ 5 from last week', trendClass:'up' },
          { label:'PEAK HOUR', val:'7-8 am', trend:'Most active window', trendClass:'neutral' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-val${s.valClass ? ' '+s.valClass : ''}`}>{s.val}</div>
            <div className={`stat-trend ${s.trendClass}`}>{s.trend}</div>
            <div className="overview-icon-bg"></div>
          </div>
        ))}
      </div>

      <div className="chart-section" style={{ marginBottom:28 }}>
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Daily Trip</span>
            <select className="filter-select"><option>February</option><option>January</option></select>
          </div>
          <div style={{ height:340 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      <div className="chart-section" style={{ marginBottom:28 }}>
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Peak Booking Hours</span>
          </div>
          <div style={{ height:320 }}>
            <Bar data={peakData} options={peakOptions} />
          </div>
        </div>
      </div>

      <div className="dash-bottom-grid" style={{ gridTemplateColumns:'1fr 1.2fr', gap:28 }}>
        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Completed vs Cancelled</span>
            <select className="filter-select"><option>February</option></select>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20, height:300, position:'relative' }}>
            <div style={{ width:140, display:'flex', flexDirection:'column', gap:60 }}>
              {[['#fa7528','Completed'],['#fca5a5','Cancelled']].map(([color,label]) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:12, background:color, borderRadius:4 }}></div>
                  <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--muted)' }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ flex:1, height:'100%', position:'relative' }}>
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="sec-header">
            <span className="sec-title">Most Active Drivers</span>
            <select className="filter-select"><option>February</option></select>
          </div>
          <div className="table-wrap" style={{ border:'none' }}>
            <table style={{ fontSize:'0.82rem' }}>
              <thead style={{ background:'var(--brand-ll)' }}>
                <tr><th>DRIVER</th><th style={{ textAlign:'center' }}>TRIPS</th><th style={{ textAlign:'center' }}>RATE</th><th style={{ textAlign:'center' }}>STATUS</th></tr>
              </thead>
              <tbody>
                {topDrivers.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td style={{ textAlign:'center', fontWeight:700 }}>{d.trips}</td>
                    <td style={{ textAlign:'center', fontWeight:600 }}>{d.rate}</td>
                    <td style={{ textAlign:'center' }}>
                      <span className={`badge ${d.statusClass}`} style={{ background:'none', border:`1.2px solid var(--${d.statusClass}-l)`, padding:'2px 10px' }}>
                        <span className="badge-dot"></span> {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
