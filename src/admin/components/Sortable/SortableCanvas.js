import React, { useState, useEffect } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import SortableColumn from "./SortableColumn";
import { mockData } from "../FlowEditor/mockdata";

const SortableCanvas = () => {
  const [columns, setColumns] = useState(mockData);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  
  function handleDragStart(event) {
    const { active } = event;
    const column = columns.find((col) => col.id === active.id);
    if (column) {
      setInitialPosition(column.position); // Captura a posição inicial ao começar o arraste
    }
  }

  function handleDragEnd(event) {
    const { active, over, delta } = event;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over?.id);

    if (!activeContainer && !overContainer) {
      // Movimentar colunas
      setColumns((columns) =>
        columns.map((column) =>
          column.id === active.id
            ? {
                ...column,
                position: {
                  x: initialPosition.x + delta.x,
                  y: initialPosition.y + delta.y,
                },
              }
            : column
        )
      );
    } else if (activeContainer && overContainer) {
      if (activeContainer === overContainer) {
        // Reordenar os fields dentro da mesma coluna
        setColumns((columns) =>
          columns.map((column) =>
            column.id === activeContainer
              ? {
                  ...column,
                  fields: arrayMove(
                    column.fields,
                    column.fields.indexOf(active.id),
                    column.fields.indexOf(over.id)
                  ),
                }
              : column
          )
        );
      } else {
        // Mover fields entre colunas diferentes
        setColumns((columns) => {
          const activeIndex = columns.findIndex(
            (column) => column.id === activeContainer
          );
          const overIndex = columns.findIndex(
            (column) => column.id === overContainer
          );

          const activeItemIndex = columns[activeIndex].fields.indexOf(active.id);
          const overItemIndex = over?.id
            ? columns[overIndex].fields.indexOf(over.id)
            : columns[overIndex].fields.length;

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
      }
    }
  }

  function handleDragMove(event) {
    const { active, delta } = event;

    const activeContainer = findContainer(active.id);
    if (!activeContainer) {
      // Movimentar colunas
      setColumns((columns) =>
        columns.map((column) =>
          column.id === active.id
            ? {
                ...column,
                position: {
                  x: initialPosition.x + delta.x,
                  y: initialPosition.y + delta.y,
                },
              }
            : column
        )
      );
      console.log('movimentando coluna para', initialPosition.x + delta.x, initialPosition.y + delta.y);
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
    <div
      style={{
        width: "100%",
        height: "500px",
        overflow: "auto",
        border: "1px solid black",
        backgroundColor: "#ccc"
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart} // Captura a posição inicial
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove} // Atualiza a posição em tempo real
      >
        <div
          style={{
            width: "1000px", // Grande largura para simular canvas infinito
            height: "1000px", // Grande altura para simular canvas infinito
            position: "relative",
          }}
        >
          {columns.map((column) => (
            <SortableColumn
              key={column.id}
              id={column.id}
              fields={column.fields}
              position={column.position}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default SortableCanvas;
