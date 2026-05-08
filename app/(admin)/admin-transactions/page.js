export default function AdminTransactionsPage() {
  return (
    <div>
      <section>
        <h1>Transactions Management</h1>
      </section>

      <section>
        <h2>Transaction Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Transaction Type</label>
            <select style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option>All</option>
              <option>Session Payment</option>
              <option>Payout</option>
              <option>Refund</option>
              <option>Fee</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date Range</label>
            <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
            <select style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option>All</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>&nbsp;</label>
            <button style={{ width: '100%', padding: '8px' }}>Search</button>
          </div>
        </div>
      </section>

      <section>
        <h2>Recent Transactions</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>User/Reader</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#TXN-1001</td>
              <td style={{ padding: '10px' }}>Session Payment</td>
              <td style={{ padding: '10px' }}>John Doe → Luna</td>
              <td style={{ padding: '10px' }}>$50.00</td>
              <td style={{ padding: '10px' }}>May 2, 2026</td>
              <td style={{ padding: '10px' }}>✅ Completed</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Details</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#TXN-1002</td>
              <td style={{ padding: '10px' }}>Payout</td>
              <td style={{ padding: '10px' }}>Luna</td>
              <td style={{ padding: '10px' }}>$2,100.00</td>
              <td style={{ padding: '10px' }}>May 1, 2026</td>
              <td style={{ padding: '10px' }}>✅ Completed</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Details</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#TXN-1003</td>
              <td style={{ padding: '10px' }}>Refund</td>
              <td style={{ padding: '10px' }}>Sarah M.</td>
              <td style={{ padding: '10px' }}>$45.00</td>
              <td style={{ padding: '10px' }}>Apr 30, 2026</td>
              <td style={{ padding: '10px' }}>✅ Completed</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Details</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#TXN-1004</td>
              <td style={{ padding: '10px' }}>Session Payment</td>
              <td style={{ padding: '10px' }}>Michael T. → Celestine</td>
              <td style={{ padding: '10px' }}>$75.00</td>
              <td style={{ padding: '10px' }}>Apr 28, 2026</td>
              <td style={{ padding: '10px' }}>⏳ Pending</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Retry</button></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>#TXN-1005</td>
              <td style={{ padding: '10px' }}>Fee</td>
              <td style={{ padding: '10px' }}>Platform</td>
              <td style={{ padding: '10px' }}>$2.50</td>
              <td style={{ padding: '10px' }}>Apr 27, 2026</td>
              <td style={{ padding: '10px' }}>✅ Completed</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Details</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Transaction Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Total Volume</strong></p>
            <p style={{ fontSize: '24px', color: '#00aa00' }}>$456,789</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Platform Fees</strong></p>
            <p style={{ fontSize: '24px', color: '#0066cc' }}>$9,135</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Reader Payouts</strong></p>
            <p style={{ fontSize: '24px', color: '#ff9800' }}>$425,000</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Pending</strong></p>
            <p style={{ fontSize: '24px', color: '#f44336' }}>$8,500</p>
          </div>
        </div>
      </section>
    </div>
  );
}
