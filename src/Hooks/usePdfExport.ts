/**
 * Hook personalizado para exportar datos como PDF
 * Utiliza la funcionalidad nativa del navegador para generar PDFs
 */

interface PdfExportColumn {
  header: string;
  key: string;
  width?: string;
}

interface PdfExportMetadata {
  [key: string]: string;
}

interface PdfExportOptions {
  title: string;
  metadata?: PdfExportMetadata;
  columns: PdfExportColumn[];
  data: any[];
  styles?: {
    fontSize?: string;
    headerBackground?: string;
    linkColor?: string;
  };
}

export const usePdfExport = () => {
  const exportToPdf = (options: PdfExportOptions) => {
    const {
      title,
      metadata = {},
      columns,
      data,
      styles = {}
    } = options;

    const {
      fontSize = '12px',
      headerBackground = '#f5f5f5',
      linkColor = '#0b5fff'
    } = styles;

    // Generar HTML del metadata
    const metadataHtml = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}<br />`)
      .join('');

    // Generar headers de la tabla
    const headersHtml = columns
      .map(col => `<th style="${col.width ? `width: ${col.width};` : ''}">${col.header}</th>`)
      .join('');

    // Generar filas de la tabla
    const rowsHtml = data
      .map(row => `
        <tr>
          ${columns.map(col => {
            const value = row[col.key] || '';
            const isLink = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
            const cellClass = isLink ? 'link' : '';
            return `<td class="${cellClass}">${value}</td>`;
          }).join('')}
        </tr>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            color: #111; 
            padding: 24px; 
          }
          h1 { 
            font-size: 18px; 
            margin: 0 0 8px; 
            font-weight: 600;
          }
          .meta { 
            font-size: ${fontSize}; 
            color: #555; 
            margin-bottom: 16px; 
            line-height: 1.5;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: ${fontSize}; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            vertical-align: top; 
            text-align: left;
          }
          th { 
            background: ${headerBackground}; 
            font-weight: 600;
          }
          .link { 
            color: ${linkColor}; 
            word-break: break-all; 
          }
          @media print {
            body { padding: 0; }
            h1 { font-size: 16px; }
            .meta, table { font-size: 10px; }
            th, td { padding: 6px; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${metadataHtml ? `<div class="meta">${metadataHtml}</div>` : ''}
        <table>
          <thead>
            <tr>
              ${headersHtml}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada por el navegador.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Esperar a que se cargue el contenido antes de imprimir
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return { exportToPdf };
};
