document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calcForm');
  const num1Input = document.getElementById('num1');
  const num2Input = document.getElementById('num2');
  const operationSelect = document.getElementById('operation');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const loadingDiv = document.getElementById('loading');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const num1 = num1Input.value.trim();
    const num2 = num2Input.value.trim();
    const operation = operationSelect.value;

    // Reset UI
    errorDiv.style.display = 'none';
    resultDiv.textContent = '';
    loadingDiv.style.display = 'flex';

    if (!num1 || !num2) {
      loadingDiv.style.display = 'none';
      errorDiv.textContent = 'Please enter both numbers.';
      errorDiv.style.display = 'block';
      return;
    }

    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <${operation} xmlns="http://tempuri.org/">
            <intA>${num1}</intA>
            <intB>${num2}</intB>
          </${operation}>
        </soap:Body>
      </soap:Envelope>`;

    try {
      const res = await fetch(
        'https://corsproxy.io/?' + encodeURIComponent('http://www.dneonline.com/calculator.asmx'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': `http://tempuri.org/${operation}`,
          },
          body: soapRequest,
        }
      );

      if (!res.ok) {
        throw new Error(`Network response was not ok, status: ${res.status}`);
      }

      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const resultTag = xmlDoc.getElementsByTagName(`${operation}Result`)[0];
      if (resultTag && resultTag.textContent) {
        resultDiv.textContent = `Result: ${resultTag.textContent}`;
      } else {
        resultDiv.textContent = 'No valid result found.';
      }
    } catch (err) {
      errorDiv.textContent = `Error: ${err.message}`;
      errorDiv.style.display = 'block';
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
});
