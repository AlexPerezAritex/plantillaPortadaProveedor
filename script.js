document.getElementById('submit-btn').addEventListener('click', async () => {
  // Obtener el archivo PDF cargado por el usuario
  const pdfUpload = document.getElementById('pdf-upload').files[0];
  // Obtener los datos del formulario
  const requisitoDocumental = document.getElementById('requisitoDocumental').value;
  const proveedor = document.getElementById('proveedor').value;
  const numeroPedido = document.getElementById('numeroPedido').value;
  const fecha = document.getElementById('fecha').value;
  const numeroPieza = document.getElementById('numeroPieza').value;
  const cantidad = document.getElementById('cantidad').value;

  // Verificar si se ha cargado un PDF
  if (!pdfUpload) {
    alert('Por favor, sube un archivo PDF.');
    return;
  }

  // Crear un FileReader para leer el contenido del PDF cargado
  const reader = new FileReader();
  reader.onload = async function (event) {
    const existingPdfBytes = new Uint8Array(event.target.result);

    // Cargar el PDF template
    const templateBytes = await fetch("./template.pdf").then(res => res.arrayBuffer());
    const templatePdf = await PDFLib.PDFDocument.load(templateBytes);

    // Crear un nuevo PDF
    const newPdf = await PDFLib.PDFDocument.create();

    // Copiar el contenido del template al nuevo PDF
    const [templatePage] = await newPdf.copyPages(templatePdf, [0]);
    newPdf.addPage(templatePage);

    // Agregar texto al nuevo PDF
    const formPage = newPdf.getPage(0);
    const { width, height } = formPage.getSize();
    formPage.drawText(requisitoDocumental, { x: 250, y: height - 190, size: 12 });
    formPage.drawText(proveedor, { x: 250, y: height - 248, size: 12 });
    formPage.drawText(numeroPedido, { x: 250, y: height - 303, size: 12 });
    formPage.drawText(fecha, { x: 250, y: height - 360, size: 12 });
    formPage.drawText(numeroPieza, { x: 250, y: height - 417, size: 12 });
    formPage.drawText(cantidad, { x: 250, y: height - 475, size: 12 });

    // Cargar el PDF subido por el usuario
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

    // Copiar todas las páginas del PDF subido al nuevo PDF
    const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => {
      newPdf.addPage(page);
    });

    // Guardar el nuevo PDF
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Crear un enlace de descarga y simular el clic
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'nuevo_pdf.pdf';
    downloadLink.click();

    // Liberar memoria
    URL.revokeObjectURL(url);
  };
  // Leer el PDF cargado como ArrayBuffer
  reader.readAsArrayBuffer(pdfUpload);
});
