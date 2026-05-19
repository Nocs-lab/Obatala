import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableField from "./SortableField"; // Certifique-se de estar importando corretamente o SortableField

const DragAndDropList = ({nodeId, fields = [], updateFields }) => {
  // Função para lidar com o fim do arraste
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Se o item não foi movido ou se não há alvo, retorna
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((item) => item.id === active.id);
    const newIndex = fields.findIndex((item) => item.id === over.id);

    // Se os índices são válidos, mova os itens
    if (oldIndex !== -1 && newIndex !== -1) {
      const newFields = arrayMove(fields, oldIndex, newIndex);
      updateFields(newFields); // Atualiza o estado com a nova ordem
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* Contexto para a lista ordenável, utilizando a estratégia de lista vertical */}
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul>
          {fields.map(({ id, title, type, config }) => (
            <SortableField
              key={id}
              nodeId={nodeId}
              id={id}
              title={title}
              config={config}
              type={type}
              updateField={(id, newValue) => {
                // Atualiza o valor do campo específico
                const newFields = fields.map((field) =>
                  field.id === id ? { ...field, value: newValue } : field
                );
                updateFields(newFields); // Atualiza o estado com o novo valor
              }}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default DragAndDropList;
