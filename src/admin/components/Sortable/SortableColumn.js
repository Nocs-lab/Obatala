import React from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SortableField from "./SortableField";

const SortableColumn = ({ id, fields, position }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition || "transform 250ms ease", // Remove a transição durante o arraste
    position: "absolute",
    top: `${position.y}px`,
    left: `${position.x}px`,
    border: isDragging ? "2px dashed #007bff" : "1px solid #ccc", // Bordas visíveis ao arrastar
    padding: "8px",
    minWidth: "200px",
    backgroundColor: isDragging ? "white" : "white", // Feedback visual ao arrastar
    borderRadius: "4px",
    cursor: "move",
    zIndex: isDragging ? 1000 : "auto", // Coloca a coluna em cima durante o arraste
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <h3>{id}</h3>
      <SortableContext items={fields}>
        {fields.map((field) => (
          <SortableField key={field} id={field} />
        ))}
      </SortableContext>
    </div>
  );
};

export default SortableColumn;
