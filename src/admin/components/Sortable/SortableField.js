import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableField = ({ id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms ease', // Ajuste a duração e o tipo de easing
    padding: '8px',
    border: '1px solid #ccc',
    marginBottom: '8px',
    backgroundColor: 'white',
    borderRadius: '4px', // Pode ajudar a suavizar a aparência visual
    boxShadow: transform ? '0 2px 5px rgba(0,0,0,0.2)' : 'none', // Adiciona um efeito de elevação enquanto é arrastado
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  );
};

export default SortableField;
