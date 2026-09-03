import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "C:\\xampp\\htdocs\\wordpress\\wp-content\\plugins\\Obatala\\presentation-build-ibram\\out";
const FINAL_PPTX = "C:\\xampp\\htdocs\\wordpress\\wp-content\\plugins\\Obatala\\Apresentacao Status Obatala IBRAM.pptx";
const SCREENSHOT_DIR = "C:\\xampp\\htdocs\\wordpress\\wp-content\\plugins\\Obatala\\manual-update-screenshots";
const ASSET_DIR = "C:\\xampp\\htdocs\\wordpress\\wp-content\\plugins\\Obatala\\presentation-build-ibram\\assets";

const W = 1280;
const H = 720;
const COLORS = {
  canvas: "#FFFFFF",
  ink: "#111111",
  muted: "#5B616E",
  panel: "#F0F2F4",
  rule: "#B8BCC4",
  accent: "#2F8DCC",
  accentSoft: "#D9EFFA",
  tainacan: "#38A169",
};

function text(slide, value, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    fontSize: style.fontSize ?? 22,
    color: style.color ?? COLORS.ink,
    bold: style.bold ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    typeface: "Arial",
  };
  return shape;
}

function footer(slide, n) {
  text(slide, String(n).padStart(2, "0"), { left: 1186, top: 652, width: 52, height: 28 }, {
    fontSize: 13,
    color: COLORS.muted,
    alignment: "right",
  });
}

function addTitle(slide, title, n) {
  text(slide, title, { left: 52, top: 38, width: 930, height: 94 }, {
    fontSize: 38,
    bold: true,
  });
  slide.shapes.add({
    geometry: "line",
    position: { left: 52, top: 132, width: 1176, height: 0 },
    fill: "none",
    line: { style: "solid", fill: COLORS.rule, width: 1 },
  });
  footer(slide, n);
}

function bulletList(slide, items, left, top, width, options = {}) {
  let y = top;
  const gap = options.gap ?? 64;
  const dotColor = options.dotColor ?? COLORS.accent;
  items.forEach((item) => {
    slide.shapes.add({
      geometry: "ellipse",
      position: { left, top: y + 8, width: 13, height: 13 },
      fill: dotColor,
      line: { style: "solid", fill: dotColor, width: 0 },
    });
    text(slide, item, { left: left + 28, top: y, width, height: 54 }, {
      fontSize: options.fontSize ?? 25,
      color: options.color ?? COLORS.ink,
    });
    y += gap;
  });
}

function addScreenshot(slide, imageAssets, file, position, alt, fit = "cover") {
  const fullPath = imageAssets.__paths[file];
  slide.shapes.add({
    geometry: "rect",
    position: {
      left: position.left - 7,
      top: position.top - 7,
      width: position.width + 14,
      height: position.height + 14,
    },
    fill: COLORS.panel,
    line: { style: "solid", fill: COLORS.rule, width: 1 },
  });
  slide.images.add({
    blob: imageAssets[file],
    contentType: "image/png",
    prompt: `Captura local incorporada de ${fullPath}`,
    alt,
    fit,
    position,
  });
}

function addNotes(slide, sources) {
  slide.speakerNotes.textFrame.setText([
    "[Sources]",
    ...sources.map((source) => `- ${source}`),
  ]);
  slide.speakerNotes.setVisible(false);
}

async function loadImageAssets(files) {
  const paths = {
    "dashboard-crop.png": path.join(ASSET_DIR, "dashboard-crop.png"),
    "processos-crop.png": path.join(ASSET_DIR, "processos-crop.png"),
    "tainacan-export-accordion-enabled.png": path.join(SCREENSHOT_DIR, "tainacan-export-accordion-enabled.png"),
  };
  const entries = await Promise.all(files.map(async (file) => [file, await fs.readFile(paths[file])]));
  return { ...Object.fromEntries(entries), __paths: paths };
}

function makeStatusDeck(imageAssets) {
  const p = Presentation.create({ slideSize: { width: W, height: H } });

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    text(slide, "Obatalá", { left: 52, top: 48, width: 240, height: 40 }, {
      fontSize: 24,
      bold: true,
      color: COLORS.accent,
    });
    text(slide, "Status atual do projeto", { left: 52, top: 172, width: 560, height: 150 }, {
      fontSize: 58,
      bold: true,
    });
    text(slide, "Exportação de itens para o Tainacan por meio de processos", {
      left: 52,
      top: 360,
      width: 540,
      height: 105,
    }, {
      fontSize: 28,
      color: COLORS.muted,
    });
    text(slide, "IBRAM | Setembro de 2026", { left: 52, top: 586, width: 460, height: 34 }, {
      fontSize: 20,
      color: COLORS.muted,
    });
    addScreenshot(
      slide,
      imageAssets,
      "dashboard-crop.png",
      { left: 662, top: 126, width: 538, height: 418 },
      "Painel administrativo do Obatalá",
      "cover",
    );
    footer(slide, 1);
    addNotes(slide, [
      "Captura local da interface administrativa do Obatalá: manual-update-screenshots/dashboard.png.",
      "Contexto solicitado pelo usuário: apresentação curta para nova equipe do IBRAM sobre o status atual do projeto.",
    ]);
  }

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    addTitle(slide, "Obatalá já opera a rotina curatorial", 2);
    text(slide, "A plataforma concentra modelos, processos, itens de acervo, grupos e documentos em uma interface administrativa integrada ao Tainacan.", {
      left: 52,
      top: 166,
      width: 650,
      height: 102,
    }, {
      fontSize: 26,
      color: COLORS.muted,
    });
    bulletList(slide, [
      "Modelos definem etapas e campos de cada fluxo curatorial.",
      "Processos registram a execução, histórico, responsáveis e documentos.",
      "Itens do acervo mostram a relação entre Tainacan e processos vinculados.",
      "Permissões organizam quem modela, executa e acompanha cada rotina.",
    ], 74, 306, 610, { fontSize: 24, gap: 70 });
    addScreenshot(
      slide,
      imageAssets,
      "processos-crop.png",
      { left: 742, top: 236, width: 438, height: 184 },
      "Tela de processos do Obatalá",
      "cover",
    );
    addNotes(slide, [
      "Captura local da interface administrativa do Obatalá: manual-update-screenshots/processos.png.",
      "Manual de Curadoria 3.1 atualizado pelo usuario e pela conversa anterior.",
    ]);
  }

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    addTitle(slide, "Exportação Tainacan fica no modelo", 3);
    text(slide, "O mapeamento deixa de ser uma configuração isolada: ele passa a fazer parte do próprio modelo de processo.", {
      left: 52,
      top: 162,
      width: 600,
      height: 96,
    }, {
      fontSize: 28,
      color: COLORS.muted,
    });
    bulletList(slide, [
      "Um acordeon habilita ou desabilita a exportação no editor do modelo.",
      "Coleções de destino são selecionadas antes do mapeamento dos campos.",
      "Cada componente de etapa pode apontar para metadados do Tainacan.",
      "Ao salvar, fluxo do processo e configuração de exportação ficam alinhados.",
    ], 74, 302, 595, { fontSize: 24, gap: 68, dotColor: COLORS.tainacan });
    addScreenshot(slide, imageAssets, "tainacan-export-accordion-enabled.png", { left: 728, top: 154, width: 478, height: 414 }, "Acordeon de exportação Tainacan habilitado no editor de modelo");
    addNotes(slide, [
      "Spec local: specs/unificar-editor-modelo-exportacao-tainacan.md.",
      "Captura local: manual-update-screenshots/tainacan-export-accordion-enabled.png.",
      "Componente de mapeamento: src/admin/components/FlowEditor/components/inputControls/TainacanFieldMappingControls.js.",
    ]);
  }

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    addTitle(slide, "A exportação já tem uma cadeia operacional definida", 4);
    const steps = [
      ["1", "Modelar", "Definir etapas e campos do processo."],
      ["2", "Mapear", "Ligar campos do Obatalá a metadados do Tainacan."],
      ["3", "Preparar", "Escolher exportação manual ou via planilha."],
      ["4", "Confirmar", "Gerar ou atualizar os itens no Tainacan."],
      ["5", "Rastrear", "Manter vínculo entre item exportado e processo."],
    ];
    const startX = 62;
    const boxW = 214;
    steps.forEach((step, idx) => {
      const x = startX + idx * 238;
      slide.shapes.add({
        geometry: "rect",
        position: { left: x, top: 210, width: boxW, height: 280 },
        fill: idx === 2 ? COLORS.accentSoft : COLORS.panel,
        line: { style: "solid", fill: COLORS.rule, width: 1 },
      });
      text(slide, step[0], { left: x + 24, top: 234, width: 50, height: 42 }, {
        fontSize: 34,
        bold: true,
        color: idx === 2 ? COLORS.accent : COLORS.ink,
      });
      text(slide, step[1], { left: x + 24, top: 300, width: boxW - 48, height: 40 }, {
        fontSize: 27,
        bold: true,
      });
      text(slide, step[2], { left: x + 24, top: 358, width: boxW - 48, height: 88 }, {
        fontSize: 19,
        color: COLORS.muted,
      });
      if (idx < steps.length - 1) {
        slide.shapes.add({
          geometry: "line",
          position: { left: x + boxW + 13, top: 350, width: 22, height: 0 },
          fill: "none",
          line: { style: "solid", fill: COLORS.accent, width: 3 },
        });
      }
    });
    text(slide, "A etapa de preparação é o ponto de decisão do usuário: exportar manualmente ou importar dados por planilha.", {
      left: 110,
      top: 552,
      width: 1050,
      height: 54,
    }, {
      fontSize: 25,
      alignment: "center",
      color: COLORS.muted,
    });
    addNotes(slide, [
      "Spec local: specs/unificar-editor-modelo-exportacao-tainacan.md.",
      "Componente de preparação: src/admin/components/ProcessManager/TainacanExportPreparation.js.",
      "Serviço backend de exportação: classes/Services/TainacanExportService.php.",
    ]);
  }

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    addTitle(slide, "Implementado: interface, persistência e execução", 5);
    const rows = [
      ["Editor unificado", "Acordeon Tainacan Export no modelo de processo."],
      ["Mapeamento por campo", "Cada componente pode ser associado a coleção e metadado."],
      ["Preparação do processo", "Usuário decide entre entrada manual e planilha CSV/XLS/XLSX."],
      ["Execução no Tainacan", "Serviço cria ou atualiza itens e guarda o resultado da exportação."],
      ["Rastreabilidade", "Itens do acervo exibem processos vinculados e histórico."],
    ];
    rows.forEach((row, idx) => {
      const y = 170 + idx * 82;
      slide.shapes.add({
        geometry: "rect",
        position: { left: 70, top: y, width: 1080, height: 1 },
        fill: COLORS.rule,
        line: { style: "solid", fill: COLORS.rule, width: 0 },
      });
      text(slide, row[0], { left: 86, top: y + 18, width: 305, height: 38 }, {
        fontSize: 23,
        bold: true,
      });
      text(slide, row[1], { left: 420, top: y + 18, width: 715, height: 38 }, {
        fontSize: 23,
        color: COLORS.muted,
      });
    });
    slide.shapes.add({
      geometry: "rect",
      position: { left: 70, top: 580, width: 1080, height: 1 },
      fill: COLORS.rule,
      line: { style: "solid", fill: COLORS.rule, width: 0 },
    });
    addNotes(slide, [
      "Spec local: specs/unificar-editor-modelo-exportacao-tainacan.md.",
      "Mapeamento por campo: src/admin/components/FlowEditor/components/inputControls/TainacanFieldMappingControls.js.",
      "Preparacao: src/admin/components/ProcessManager/TainacanExportPreparation.js.",
      "Execução: classes/Services/TainacanExportService.php.",
      "Rastreabilidade: src/admin/components/TainacanItems/TainacanItemsPage.js e TainacanItemTimeline.js.",
    ]);
  }

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    addTitle(slide, "Funcionalidade em validação", 6);
    text(slide, "Estado atual", { left: 72, top: 178, width: 460, height: 36 }, {
      fontSize: 26,
      bold: true,
      color: COLORS.accent,
    });
    text(slide, "A especificação está marcada como em validação. A base de interface e serviços existe; o próximo valor vem de testes orientados por coleções e processos reais.", {
      left: 72,
      top: 228,
      width: 470,
      height: 160,
    }, {
      fontSize: 25,
      color: COLORS.muted,
    });
    text(slide, "Pontos de atenção", { left: 674, top: 178, width: 460, height: 36 }, {
      fontSize: 26,
      bold: true,
      color: COLORS.tainacan,
    });
    bulletList(slide, [
      "Validar fim a fim com coleções piloto do IBRAM.",
      "Conferir permissões e contratos REST em perfis reais.",
      "Refinar mensagens de erro para importação por planilha.",
      "Fechar critérios de aceite antes da implantação assistida.",
    ], 690, 232, 500, { fontSize: 23, gap: 66, dotColor: COLORS.tainacan });
    addNotes(slide, [
      "Status da spec local: specs/unificar-editor-modelo-exportacao-tainacan.md.",
      "Pontos inferidos a partir dos critérios de aceite da própria especificação e da conversa com o usuário.",
    ]);
  }

  {
    const slide = p.slides.add();
    slide.background.fill = COLORS.canvas;
    addTitle(slide, "Próximo passo: piloto com a equipe do IBRAM", 7);
    text(slide, "O objetivo da próxima rodada é transformar a funcionalidade em um fluxo confiável para acervos reais.", {
      left: 64,
      top: 168,
      width: 1010,
      height: 76,
    }, {
      fontSize: 30,
      color: COLORS.muted,
    });
    const actions = [
      ["Escolher", "um modelo de processo e uma coleção piloto."],
      ["Mapear", "campos essenciais aos metadados do Tainacan."],
      ["Executar", "cenarios manual e via planilha."],
      ["Ajustar", "rótulos, validações e documentação."],
    ];
    actions.forEach((action, idx) => {
      const x = 74 + idx * 292;
      text(slide, action[0], { left: x, top: 322, width: 230, height: 42 }, {
        fontSize: 32,
        bold: true,
      });
      slide.shapes.add({
        geometry: "line",
        position: { left: x, top: 382, width: 190, height: 0 },
        fill: "none",
        line: { style: "solid", fill: idx % 2 === 0 ? COLORS.accent : COLORS.tainacan, width: 4 },
      });
      text(slide, action[1], { left: x, top: 416, width: 230, height: 90 }, {
        fontSize: 23,
        color: COLORS.muted,
      });
    });
    text(slide, "Resultado esperado: exportação rastreável, repetível e compreensível pela equipe que opera os processos.", {
      left: 128,
      top: 588,
      width: 1020,
      height: 50,
    }, {
      fontSize: 25,
      alignment: "center",
      color: COLORS.ink,
    });
    addNotes(slide, [
      "Próximos passos sintetizados a partir do foco informado pelo usuário e dos critérios de validação da spec local.",
      "Spec local: specs/unificar-editor-modelo-exportacao-tainacan.md.",
    ]);
  }

  return p;
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const imageAssets = await loadImageAssets([
    "dashboard-crop.png",
    "processos-crop.png",
    "tainacan-export-accordion-enabled.png",
  ]);
  const presentation = makeStatusDeck(imageAssets);

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(OUT_DIR, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
    await fs.writeFile(path.join(OUT_DIR, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
  }
  await writeBlob(path.join(OUT_DIR, "montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 1 }));
  await fs.writeFile(path.join(OUT_DIR, "inspect.ndjson"), (await presentation.inspect({ kind: "slide,textbox,shape,image,notes", maxChars: 20000 })).ndjson);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
