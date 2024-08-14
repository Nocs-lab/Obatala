import React from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import SortableField from "./SortableField";
const SortableColumn = ({ id, fields }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, border: "1px solid #ccc", padding: "8px", minWidth: "200px", backgroundColor: "white", borderRadius: "4px" }}
      {...attributes}
      {...listeners}
    >
      <h3>{id}</h3>
      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
        {fields.map((field) => (
          <SortableField key={field} id={field} />
        ))}
      </SortableContext>
    </div>
  );
};

export default SortableColumn;
