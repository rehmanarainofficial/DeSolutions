import { generatePDF } from 'react-native-html-to-pdf';
import RNShare from 'react-native-share';

export const generateAndShareStatementPDF = async (customerName = 'Statement', paymentTerms = '0', reportData = []) => {
  
  let current = 0;
  let d1to60 = 0;
  let d61to120 = 0;
  let over120 = 0;
  let totalBalance = 0;

  const rowsHtml = reportData.length > 0 ? reportData.map(row => {
    const bal = parseFloat(row.bal_amount || 0);
    const days = parseInt(row.days || 0);
    totalBalance += bal;
    
    if (days <= 0) current += bal;
    else if (days <= 60) d1to60 += bal;
    else if (days <= 120) d61to120 += bal;
    else over120 += bal;

    return `<tr>
      <td>${row.tran_date || ''}</td>
      <td>${row.due_date || ''}</td>
      <td>${row.days || 0}</td>
      <td>${row.reference || ''}</td>
      <td>${row.branch_name || ''}</td>
      <td>${row.cust_ref || '-'}</td>
      <td class="right">${parseFloat(row.debit_amount || 0).toLocaleString()}</td>
      <td class="right">${parseFloat(row.credit_amount || 0).toLocaleString()}</td>
      <td class="right">${parseFloat(row.allocated_amount || 0).toLocaleString()}</td>
      <td class="right">${parseFloat(row.bal_amount || 0).toLocaleString()}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="10" style="text-align: center;">No outstanding records found</td></tr>';

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth()+1).padStart(2, '0')}-${today.getFullYear()} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #000; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; }
          .statement-text { font-size: 24px; color: #ccc; letter-spacing: 2px; }
          .charge-to { font-size: 10px; font-weight: bold; margin-bottom: 5px; }
          .customer-name { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
          .meta-info { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 30px; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f0f0f0; }
          .right { text-align: right; }
          .totals { display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
          .total-col { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header-row">
          <div class="logo">ANWAR & SONS</div>
          <div class="statement-text">STATEMENT</div>
        </div>
        <div class="charge-to">Charge To</div>
        <div class="customer-name">${customerName}</div>
        <div style="font-size: 10px;">Payment Terms: ${paymentTerms} Days</div>
        <div class="meta-info">
          <div></div>
          <div>Date: ${dateStr}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>DueDate</th>
              <th>Days</th>
              <th>Ref #</th>
              <th>Branch</th>
              <th>PO #</th>
              <th class="right">Charges</th>
              <th class="right">Credits</th>
              <th class="right">Allocated</th>
              <th class="right">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-col">Current<br/>${current.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div class="total-col">1-60 Days<br/>${d1to60.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div class="total-col">61-120 Days<br/>${d61to120.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div class="total-col">Over 120 Days<br/>${over120.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div class="total-col">Balance<br/>${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </body>
    </html>
  `;

  try {
    const options = {
      html: htmlContent,
      fileName: 'Ledger_Statement_' + customerName.replace(/[^a-zA-Z0-9]/g, '_'),
    };
    const file = await generatePDF(options);
    
    const filePath = file.filePath.startsWith('file://') ? file.filePath : `file://${file.filePath}`;
    const encodedPath = encodeURI(filePath);

    await RNShare.open({
      url: encodedPath,
      title: 'Share Statement',
      message: 'Please find the attached ledger statement.',
      type: 'application/pdf',
    });
  } catch (e) {
    console.log('Error generating PDF', e);
  }
};
