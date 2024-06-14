const fechaActual = new Date();

console.log(fechaActual);

document.querySelector('#fecha').valueAsDate = fechaActual;

const obj = {
  requisitoDocumental: '',
  proveedor: '',
  numeroPedido: '',
  fecha: '',
  numeroPieza: '',
  cantidad: ''
}

const array = [{}];

document.querySelector('#add-pieza-btn').addEventListener('click', () => {
  let tr1 = document.createElement("tr");
  tr1.classList.add('border-1', `numeroPieza${array.length + 1}`)
  

  let tr2 = document.createElement("tr");
  tr2.classList.add('border-1', `cantidad${array.length + 1}`)
  const htmltr1 = `
    <th class="text-start border-1 bg-secondary bg-opacity-25 p-2">
      <label for="numeroPieza${array.length + 1}" class="form-label">
        <p class="pt-1 my-0">${array.length + 1} Nº Pieza:</p>
        <p class="my-0">Part Number:</p>
      </label>
    </th>
    <td class="border-1 ">
      <input type="text" id="numeroPieza${array.length + 1}" maxlength="27"
        class="form-control border-0 m-0 py-3 rounded-0 text-center text-uppercase " style="font-size: 2em;">
    </td>
  `
  const htmltr2 = `
    <th class="text-start border-1 bg-secondary bg-opacity-25 p-2">
      <label for="cantidad${array.length + 1}" class="form-label">
        <p class="pt-1 my-0">Cantidad:</p>
        <p class="my-0">Quantity:</p>
      </label></th>
    <td class="border-1 ">
      <input type="text" id="cantidad${array.length + 1}" maxlength="27"
        class="form-control border-0 m-0 py-3 rounded-0 text-center text-uppercase " style="font-size: 2em;">
    </td>
  `
  tr1.innerHTML = htmltr1;
  tr2.innerHTML = htmltr2;
  const table1 = document.querySelector('table');
  table1.appendChild(tr1);
  table1.appendChild(tr2);

  array.push({});
});

document.querySelector('#remove-pieza-btn').addEventListener('click', () => {
  const table1 = document.querySelector('table');
  const tr1 = document.querySelector(`.numeroPieza${array.length}`)
  const tr2 = document.querySelector(`.cantidad${array.length}`)

  table1.removeChild(tr2)
  table1.removeChild(tr1)
  array.pop()
})


document.getElementById('submit-btn').addEventListener('click', async () => {
  const requisitoDocumental = document.getElementById('requisitoDocumental').value.toUpperCase();
  const proveedor = document.getElementById('proveedor').value.toUpperCase();
  const numeroPedido = document.getElementById('numeroPedido').value.toUpperCase();
  const fechaInput = document.getElementById('fecha').value;
  const date = new Date(fechaInput);

  const dia = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const mes = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const fecha = `${dia}/${mes}/${date.getFullYear()}`;

  array.forEach((element, index) => {
    const numeroPieza = document.getElementById('numeroPieza' + (index + 1)).value.toUpperCase();
    const cantidad = document.getElementById('cantidad' + (index + 1)).value.toUpperCase();

    element.requisitoDocumental = requisitoDocumental;
    element.proveedor = proveedor;
    element.numeroPedido = numeroPedido;
    element.fecha = fecha;
    element.numeroPieza = numeroPieza;
    element.cantidad = cantidad;
  });

  const pdfUpload = document.getElementById('pdf-upload').files;
  if (pdfUpload.length === 0) {
    alert('Por favor, sube al menos un archivo PDF.');
    return;
  }

  for (let i = 0; i < array.length; i++) {
    const newPdf = await PDFLib.PDFDocument.create();

    const templateBytes = await fetch("./template.pdf").then(res => res.arrayBuffer());
    const templatePdf = await PDFLib.PDFDocument.load(templateBytes);
    const [templatePage] = await newPdf.copyPages(templatePdf, [0]);
    newPdf.addPage(templatePage);

    const formPage = newPdf.getPage(0);
    const { width, height } = formPage.getSize();

    const textSize = 17;
    const titleSize = 32;

    const font = await newPdf.embedFont(PDFLib.StandardFonts.Helvetica);
    const fontBold = await newPdf.embedFont(PDFLib.StandardFonts.HelveticaBold);

    const drawCenteredText = (text, y, size, font) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = (width - textWidth) / 2 + 100;
      formPage.drawText(text, { x, y, size, font });
    };

    const element = array[i];
    drawCenteredText(element.requisitoDocumental, height - 195, titleSize, fontBold);
    drawCenteredText(element.proveedor, height - 248, textSize, font);
    drawCenteredText(element.numeroPedido, height - 303, textSize, font);
    drawCenteredText(element.fecha, height - 360, textSize, font);
    drawCenteredText(element.numeroPieza, height - 419, textSize, font);
    drawCenteredText(element.cantidad, height - 475, textSize, font);

    for (let j = 0; j < pdfUpload.length; j++) {
      const existingPdfBytes = new Uint8Array(await pdfUpload[j].arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => {
        newPdf.addPage(page);
      });
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${element.requisitoDocumental}_${element.numeroPieza}.pdf`;
    downloadLink.click();

    URL.revokeObjectURL(url);
  }
});
