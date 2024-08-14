import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { closestCorners } from "@dnd-kit/core";
import SortableColumn from "./SortableColumn";

const mockData = [
  {
    id: "Etapa 1",
    fields: ["Nome", "E-mail", "Telefone"],
  },
  {
    id: "Etapa 2",
    fields: ["Endereço", "Cidade", "Estado"],
  },
  {
    id: "Etapa 3",
    fields: ["CEP", "País", "Notas"],
  },
  {
    id: "Etapa 4",
    fields: ["Comentários"],
  },
  {
    id: "Etapa 5",
    fields: ["Item 1", "Item 2", "Item 3"],
  }
];

const SortableCanvas = () => {
  const [columns, setColumns] = useState(mockData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
  
    if (!over) return;
  
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
  
    // Verificar se ambos `active.id` e `over.id` pertencem às colunas
    if (!activeContainer && !overContainer) {
      const activeIndex = columns.findIndex((column) => column.id === active.id);
      const overIndex = columns.findIndex((column) => column.id === over.id);
  
      if (activeIndex !== overIndex) {
        setColumns((columns) => arrayMove(columns, activeIndex, overIndex));
      }
    } else if (activeContainer && overContainer && activeContainer !== overContainer) {
      // Esta seção lida com a movimentação de campos entre colunas
      setColumns((columns) => {
        const activeIndex = columns.findIndex(
          (column) => column.id === activeContainer
        );
        const overIndex = columns.findIndex(
          (column) => column.id === overContainer
        );
  
        const activeItemIndex = columns[activeIndex].fields.indexOf(active.id);
        const overItemIndex = columns[overIndex].fields.indexOf(over.id);
  
        return columns.map((column, index) => {
          if (index === activeIndex) {
            return {
              ...column,
              fields: column.fields.filter((item) => item !== active.id),
            };
          } else if (index === overIndex) {
            const newFields = [...column.fields];
            newFields.splice(overItemIndex, 0, active.id);
            return { ...column, fields: newFields };
          }
          return column;
        });
      });
    } else if (activeContainer && activeContainer === overContainer) {
      // Lógica para reordenar campos dentro da mesma coluna
      setColumns((columns) => {
        const activeIndex = columns.findIndex(
          (column) => column.id === activeContainer
        );
        const oldIndex = columns[activeIndex].fields.indexOf(active.id);
        const newIndex = columns[activeIndex].fields.indexOf(over.id);
  
        return columns.map((column, index) => {
          if (index === activeIndex) {
            return {
              ...column,
              fields: arrayMove(column.fields, oldIndex, newIndex),
            };
          }
          return column;
        });
      });
    }
  }
  
  
  

  function findContainer(id) {
    for (const column of columns) {
      if (column.fields.includes(id)) {
        return column.id;
      }
    }
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columns.map((column) => column.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          {columns.map((column) => (
            <SortableColumn
              key={column.id}
              id={column.id}
              fields={column.fields}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableCanvas;
