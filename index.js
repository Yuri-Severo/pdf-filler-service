const express = require("express");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const app = express();
app.use(express.json());

app.post("/preencher-pdf", async (req, res) => {
  try {
    const { evento, equipamento } = req.body;

    // Lê o PDF original
    const pdfPath = "./termo-template.pdf";
    const existingPdfBytes = fs.readFileSync(pdfPath);

    // Carrega o documento PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Permite edição de formulários
    const form = pdfDoc.getForm();

    if (evento.tipo === "Recebimento") {
      console.log("Novo evento de Recebimento recebido");
      form.getTextField("tipo_verbo_field").setText("recebido");
    }
    
    if (evento.tipo === "Devolucao") {
      console.log("Novo evento de Devolução recebido");
      form.getTextField("tipo_verbo_field").setText("devolvido");
    }

    if (evento.tipo === "Cautela") {
      console.log("Novo evento de Cautela recebido");
      form.getTextField("tipo_verbo_field").setText("cautelado");
    }
    
    if (evento.tipo === "Descautela") {
      console.log("Novo evento de Descautela recebido");
      form.getTextField("tipo_verbo_field").setText("descautelado");
    }
    
    form.getTextField("tipo_evento_field").setText(evento.tipo.toUpperCase());
    
    form.getTextField("protocolo_field").setText(evento.protocolo);
   
    form
      .getTextField("tipo_equipamento_field")
      .setText(equipamento.tipo_equipamento);
    
    form.getTextField("numero_serie_field").setText(equipamento.numero_serie);
    
    form
      .getTextField("registro_patrimonio_field")
      .setText(equipamento.registro_patrimonio);
    
    form.getTextField("nome_entregador_field").setText(evento.nome_entregador);
    form.getTextField("nome_receptor_field").setText(evento.nome_receptor);
    form.getTextField("data_field").setText(evento.data);
    
    form.getTextField("observacao_field").setText(`
    Memoria RAM(Gb): ${equipamento.memoria_ram_gb}, Processador: ${equipamento.processador}, 
    DVD: ${equipamento.dvd}, Fonte: ${equipamento.fonte}, Placa Mae: ${equipamento.placa_mae},
    Placa Wi-Fi: ${equipamento.placa_wifi}, Antena: ${equipamento.antena},
    Cabo de Forca: ${equipamento.cabo_fonte}, N/S cabo de Forca: ${equipamento.numero_serie_cabo_fonte},
    `);

    

    // Flatteia o formulário (aplica os valores no PDF)
    form.flatten();

    // Salva o novo PDF em memória
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Retorna o PDF como download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=preenchido.pdf",
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao processar PDF:", error);
    res.status(500).send({ error: "Erro ao processar o PDF." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Microserviço rodando em http://localhost:${PORT}/preencher-pdf`);
});
