export default function AdminReportsPage() {
  return (
    <div>
      <section>
        <h1>Reports & Complaints Management</h1>
      </section>

      <section>
        <h2>Report Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Issue Type</label>
            <select style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option>All</option>
              <option>Payment Issue</option>
              <option>Reader Complaint</option>
              <option>User Complaint</option>
              <option>Technical Bug</option>
              <option>Fraud Report</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
            <select style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option>All</option>
              <option>Pending</option>
              <option>In Review</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Priority</label>
            <select style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>&nbsp;</label>
            <button style={{ width: '100%', padding: '8px' }}>Search</button>
          </div>
        </div>
      </section>

      <section>
        <h2>Active Reports</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Reporter</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Subject</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Priority</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#IR-001</td>
              <td style={{ padding: '10px' }}>Payment Issue</td>
              <td style={{ padding: '10px' }}>User#456</td>
              <td style={{ padding: '10px' }}>Session payment failed</td>
              <td style={{ padding: '10px' }}>🔴 High</td>
              <td style={{ padding: '10px' }}>Pending</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Resolve</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#IR-002</td>
              <td style={{ padding: '10px' }}>Reader Complaint</td>
              <td style={{ padding: '10px' }}>Reader#78</td>
              <td style={{ padding: '10px' }}>User no-show</td>
              <td style={{ padding: '10px' }}>🟡 Medium</td>
              <td style={{ padding: '10px' }}>In Review</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Details</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#IR-003</td>
              <td style={{ padding: '10px' }}>User Complaint</td>
              <td style={{ padding: '10px' }}>User#789</td>
              <td style={{ padding: '10px' }}>Inappropriate behavior</td>
              <td style={{ padding: '10px' }}>🔴 High</td>
              <td style={{ padding: '10px' }}>In Review</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Details</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#IR-004</td>
              <td style={{ padding: '10px' }}>Technical Bug</td>
              <td style={{ padding: '10px' }}>User#123</td>
              <td style={{ padding: '10px' }}>Chat not loading</td>
              <td style={{ padding: '10px' }}>🟡 Medium</td>
              <td style={{ padding: '10px' }}>Resolved</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Closed</button></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>#IR-005</td>
              <td style={{ padding: 'padding: 10px' }}>Fraud Report</td>
              <td style={{ padding: '10px' }}>System</td>
              <td style={{ padding: '10px' }}>Suspected account takeover</td>
              <td style={{ padding: '10px' }}>🔴 High</td>
              <td style={{ padding: '10px' }}>Pending</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Investigate</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Report Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Total Reports</strong></p>
            <p style={{ fontSize: '24px' }}>247</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Pending</strong></p>
            <p style={{ fontSize: '24px', color: '#f44336' }}>12</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>In Review</strong></p>
            <p style={{ fontSize: '24px', color: '#ff9800' }}>8</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Resolved</strong></p>
            <p style={{ fontSize: '24px', color: '#4caf50' }}>227</p>
          </div>
        </div>
      </section>
    </div>
  );
}
