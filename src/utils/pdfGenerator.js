import { generatePDF } from 'react-native-html-to-pdf';
import { Share } from 'react-native';

export const generateAndShareStatementPDF = async (customerName = 'Shifa International Hospital Distribution', paymentTerms = '0') => {
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
          <div>Date: 07-05-2026 09:05 am</div>
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
            <tr><td>01-01-26</td><td>02-03-26</td><td>126</td><td>SI0180126</td><td>Shifa Intl</td><td>0000335465 30Dec25</td><td class="right">30,279</td><td class="right">0</td><td class="right">0</td><td class="right">30,279</td></tr>
            <tr><td>01-01-26</td><td>02-03-26</td><td>126</td><td>SI0190126</td><td>Shifa Intl</td><td>0000335449 30Dec25</td><td class="right">55,049</td><td class="right">0</td><td class="right">0</td><td class="right">55,049</td></tr>
            <tr><td>03-01-26</td><td>04-03-26</td><td>124</td><td>SI0250126</td><td>Shifa Intl</td><td>0000334514 23Dec25</td><td class="right">35,400</td><td class="right">0</td><td class="right">0</td><td class="right">35,400</td></tr>
            <tr><td>09-01-26</td><td>10-03-26</td><td>118</td><td>SI0500126</td><td>Shifa Intl</td><td>0000335710 02Jan26</td><td class="right">118,000</td><td class="right">0</td><td class="right">0</td><td class="right">118,000</td></tr>
            <tr><td>14-01-26</td><td>15-03-26</td><td>113</td><td>SI0840126</td><td>Shifa Intl</td><td>0000336588 09Dec26</td><td class="right">880,615</td><td class="right">0</td><td class="right">0</td><td class="right">880,615</td></tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="total-col">Current<br/>0</div>
          <div class="total-col">1-60 Days<br/>4,977,363</div>
          <div class="total-col">61-120 Days<br/>6,835,479</div>
          <div class="total-col">Over 120 Days<br/>120,728</div>
          <div class="total-col">Balance<br/>11,933,570</div>
        </div>
      </body>
    </html>
  `;

  try {
    const options = {
      html: htmlContent,
      fileName: 'Ledger_Statement_' + customerName.replace(/\s+/g, '_'),
      directory: 'Documents',
    };
    const file = await generatePDF(options);
    
    await Share.share({
      url: `file://${file.filePath}`,
      title: 'Share Statement',
      message: 'Please find the attached ledger statement.',
    });
  } catch (e) {
    console.log('Error generating PDF', e);
  }
};
