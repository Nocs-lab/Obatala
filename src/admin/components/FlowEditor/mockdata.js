const mockData = [
  {
    id: "Etapa 1",
    position: { x: 20, y: 20 },
    stageName: 'Nome da Etapa 1',
    fields: [
      { id: 'text-1', title: 'Nome', type: 'text', value: '' },
      { id: 'email-1', title: 'Email', type: 'email', value: '' },
    ],
  },
  {
    id: "Etapa 2",
    position: { x: 250, y: 120 },
    stageName: 'Nome da Etapa 2',
    fields: [
      { id: 'phone-1', title: 'Telefone', type: 'phone', value: '' },
      { id: 'number-1', title: 'Idade', type: 'number', value: '' },
    ],
  },
  {
    id: "Etapa 3",
    position: { x: 480, y: 20 },
    stageName: 'Nome da Etapa 3',
    fields: [
      { id: 'datepicker-1', title: 'Data de Nascimento', type: 'datepicker', value: '' },
      { id: 'upload-1', title: 'Currículo', type: 'upload', value: '' },
    ],
  },
  {
    id: "Etapa 4",
    position: { x: 600, y: 150 },
    stageName: 'Nome da Etapa 4',
    fields: [
      { id: 'select-1', title: 'Opções', type: 'select', value: '' },
      { id: 'radio-1', title: 'Escolha', type: 'radio', value: '' },
    ],
  },
];

// Conexões entre os nós (edges)
const connections = [
  { id: 'e1-2', source: 'Etapa 1', target: 'Etapa 2', type: 'buttonedge' },
  { id: 'e2-3', source: 'Etapa 2', target: 'Etapa 3', type: 'buttonedge' },
  { id: 'e3-4', source: 'Etapa 3', target: 'Etapa 4', type: 'buttonedge' },
];

export { mockData, connections };
