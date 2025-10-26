// Export report utilities for FlacronAI

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const exportReport = async (reportId, format, authToken) => {
  try {
    const exportUrl = `${API_BASE_URL}/reports/${reportId}/export`;
    console.log('📤 Exporting report:', { reportId, format, exportUrl, hasToken: !!authToken });

    const response = await fetch(exportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ format })
    });

    console.log('Export response status:', response.status);
    const result = await response.json();
    console.log('Export result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to export report');
    }

    if (format === 'html') {
      // Open HTML in new window
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(result.html);
        newWindow.document.close();
      }
    } else {
      // Download file (DOCX or PDF)
      if (result.url) {
        // Construct full URL with backend base
        const fullUrl = result.url.startsWith('http')
          ? result.url
          : `${API_BASE_URL.replace('/api', '')}${result.url}`;

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = result.fileName || `report.${format}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    return result;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const exportAsDocx = (reportId, authToken) => exportReport(reportId, 'docx', authToken);
export const exportAsPdf = (reportId, authToken) => exportReport(reportId, 'pdf', authToken);
export const exportAsHtml = (reportId, authToken) => exportReport(reportId, 'html', authToken);

export default {
  exportReport,
  exportAsDocx,
  exportAsPdf,
  exportAsHtml
};
