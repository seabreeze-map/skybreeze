import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportDashboardToPDF(elementId = 'dashboard-export-content', filename = 'Sky_Breeze_Tikinti_Hesabati.pdf') {
  const element = document.getElementById(elementId) || document.querySelector('main.main-content');
  if (!element) {
    throw new Error('Hesabat məzmunu tapılmadı');
  }

  // Hide any elements with no-print or interactive elements temporarily
  const noPrintEls = element.querySelectorAll('.no-print, .refresh-indicator');
  noPrintEls.forEach(el => { el.dataset.prevDisplay = el.style.display; el.style.display = 'none'; });

  try {
    // Generate high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for sharp text & crisp vector-like charts
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#F8FAFC',
      logging: false,
      windowWidth: 1280,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // PDF setup in A4 portrait
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 16; // 8mm margins left and right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 8; // top margin 8mm

    // Add first page
    pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight, '', 'FAST');
    heightLeft -= (pdfHeight - 16);

    // If multi-page needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 8;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= (pdfHeight - 16);
    }

    pdf.save(filename);
    return true;
  } finally {
    // Restore display
    noPrintEls.forEach(el => { el.style.display = el.dataset.prevDisplay || ''; });
  }
}
