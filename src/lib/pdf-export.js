import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportDashboardToPDF(elementId = 'dashboard-export-content', filename = 'Sky_Breeze_Tikinti_Hesabati.pdf') {
  const element = document.getElementById(elementId) || document.querySelector('main.main-content');
  if (!element) {
    throw new Error('Hesabat məzmunu tapılmadı');
  }

  // Detect current theme
  const computedStyle = window.getComputedStyle(document.body);
  const bgColor = computedStyle.backgroundColor || '#0f172a';

  // Hide interactive or temporary elements
  const noPrintEls = element.querySelectorAll('.no-print, .refresh-indicator');
  noPrintEls.forEach(el => { el.dataset.prevDisplay = el.style.display; el.style.display = 'none'; });

  try {
    // Generate high-resolution canvas with full width
    const canvas = await html2canvas(element, {
      scale: 2, // 2x high resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
      logging: false,
      windowWidth: 1280,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // PDF in A4 portrait
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 6; // 6mm margins
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, '', 'FAST');
    heightLeft -= (pdfHeight - (margin * 2));

    // Multi-page if content is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= (pdfHeight - (margin * 2));
    }

    pdf.save(filename);
    return true;
  } finally {
    // Restore display
    noPrintEls.forEach(el => { el.style.display = el.dataset.prevDisplay || ''; });
  }
}
