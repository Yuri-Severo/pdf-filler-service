const express = require("express");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const app = express();
app.use(express.json());

app.post("/preencher-pdf", async (req, res) => {
  try {
    const {tipo_evento, id, protocolo, data_recebimento, tecnico_recebedor, nome_solicitante, avaria_descricao, equipamento} = req.body;

    if(tipo_evento === "NovoRecebimento") {
      console.log("Evento de Novo Recebimento recebido");
    }
    // Lê o PDF original
    const pdfPath = "./termo-recebimento-editavel-template.pdf";
    const existingPdfBytes = fs.readFileSync(pdfPath);

    // Carrega o documento PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Permite edição de formulários
    const form = pdfDoc.getForm();

    // Preenche os campos com os dados recebidos
    form.getTextField("protocolo_field").setText(protocolo);
    form.getTextField("setor_field").setText(equipamento.setor);
    form.getTextField("equipamento_field").setText(equipamento.tipo_equipamento);
    form.getTextField("numero_serie_field").setText(equipamento.numero_serie);
    form.getTextField("registro_patrimonio_field").setText(equipamento.registro_patrimonio);
    form.getTextField("obs_field").setText(`
      Memoria RAM(Gb): ${equipamento.memoria_ram_gb}, Processador: ${equipamento.processador}, 
      DVD: ${equipamento.dvd}, Fonte: ${equipamento.fonte}, Placa Mae: ${equipamento.placa_mae},
      Placa Wi-Fi: ${equipamento.placa_wifi}, Antena: ${equipamento.antena},
      Cabo de Forca: ${equipamento.cabo_fonte}, N/S cabo de Forca: ${equipamento.numero_serie_cabo_fonte},
      `);
    
    form.getTextField("nome_solicitante_field").setText(nome_solicitante);
    form.getTextField("tecnico_recebedor_field").setText(tecnico_recebedor);
    form.getTextField("avaria_descricao_field").setText(avaria_descricao);
    form.getTextField("data_recebimento_field").setText(data_recebimento);

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
