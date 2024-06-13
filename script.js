const fechaActual = new Date()

console.log(fechaActual)

document.querySelector('#fecha').valueAsDate = fechaActual

const obj={
  requisitoDocumental:'',
  proveedor:'',
  numeroPedido:'',
  fecha:'',
  numeroPieza:'',
  cantidad:''
}

const array = []
array.push({})

document.querySelector('#add-pieza-btn').addEventListener('click', ()=>{
  let tr1 = document.createElement("tr");
  tr1.classList.add('border-1')
 
  
  let tr2 = document.createElement("tr");
  tr2.classList.add('border-1')
  const htmltr1 = `
          <th class="text-start border-1 bg-secondary bg-opacity-25 p-2">
            <label for="numeroPieza${array.length+1}" class="form-label">
              <p class="pt-1 my-0">${array.length+1} Nº Pieza:</p>
              <p class="my-0">Part Number:</p>
            </label>
          </th>
          <td class="border-1 ">
            <input type="text" id="numeroPieza${array.length+1}" maxlength="27"
              class="form-control border-0 m-0 py-3 rounded-0 text-center text-uppercase " style="font-size: 2em;">
          </td>
        `
      const htmltr2 =  `
          <th class="text-start border-1 bg-secondary bg-opacity-25 p-2">
            <label for="cantidad${array.length+1}" class="form-label">
              <p class="pt-1 my-0">Cantidad:</p>
              <p class="my-0">Quantity:</p>
            </label></th>
          <td class="border-1 ">
            <input type="text" id="cantidad${array.length+1}" maxlength="27"
              class="form-control border-0 m-0 py-3 rounded-0 text-center text-uppercase " style="font-size: 2em;">
          </td>
        `
        tr1.innerHTML = htmltr1
        tr2.innerHTML = htmltr2
        const table1 = document.querySelector('table')
        table1.appendChild(tr1)
        const table2 = document.querySelector('table')
        table2.appendChild(tr2)
        
  array.push({})
})


document.getElementById('submit-btn').addEventListener('click', async () => {
  // Obtener el archivo PDF cargado por el usuario
  const pdfUpload = document.getElementById('pdf-upload').files[0];
  // Obtener los datos del formulario
  const requisitoDocumental = document.getElementById('requisitoDocumental').value.toUpperCase();
  const proveedor = document.getElementById('proveedor').value.toUpperCase();
  const numeroPedido = document.getElementById('numeroPedido').value.toUpperCase();
  const fechaInput = document.getElementById('fecha').value;
  const date = new Date(fechaInput)
  
  let dia = ''
  let mes = ''
  if(date.getDate()<10){
    dia =  "0" + date.getDate()
  }else{
    dia = date.getDate()
  }
  if(date.getMonth()<9){
    mes =  "0" + (date.getMonth()+1)
  }else{
    mes = (date.getMonth()+1)
  }

  const fecha = dia + '/' + mes + '/' + date.getFullYear()
  
  array.map((element, index) =>{
    const numeroPieza = document.getElementById('numeroPieza'+(index+1)).value.toUpperCase();
    const cantidad = document.getElementById('cantidad'+(index+1)).value.toUpperCase();
    
    obj.requisitoDocumental = requisitoDocumental
    obj.proveedor = proveedor
    obj.numeroPedido = numeroPedido
    obj.fecha = fecha
    obj.numeroPieza = numeroPedido
    obj.cantidad = cantidad
    
    element = obj
  })

  

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

    // Definir tamaño del texto
    const textSize = 17;
    const titleSize = 32;

    // Obtener la fuente 
    const font = await newPdf.embedFont(PDFLib.StandardFonts.Helvetica);
    const fontBold = await newPdf.embedFont(PDFLib.StandardFonts.HelveticaBold);

    // Función para centrar texto
    const drawCenteredText = (text, y, size, font) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = (width - textWidth) / 2 + 100;
      formPage.drawText(text, { x, y, size, font });
    };

    drawCenteredText(requisitoDocumental, height - 195, titleSize, fontBold);
    drawCenteredText(proveedor, height - 248, textSize, font);
    drawCenteredText(numeroPedido, height - 303, textSize, font);
    drawCenteredText(fecha, height - 360, textSize, font);
    drawCenteredText(numeroPieza, height - 419, textSize, font);
    drawCenteredText(cantidad, height - 475, textSize, font);

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
    downloadLink.download =  `${requisitoDocumental}_${numeroPieza}.pdf`;
    downloadLink.click();

    // Liberar memoria
    URL.revokeObjectURL(url);
  };
  // Leer el PDF cargado como ArrayBuffer
  reader.readAsArrayBuffer(pdfUpload);
});
