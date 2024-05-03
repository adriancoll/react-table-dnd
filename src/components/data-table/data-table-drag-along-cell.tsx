import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cell, flexRender } from "@tanstack/react-table";
import { CSSProperties, PropsWithChildren } from "react";
import { TableCell } from "../ui/table";

interface Props<T> extends PropsWithChildren {
  cell: Cell<T, unknown>;
}

export const DataTableDragAlongCell = <T,>({ cell }: Props<T>) => {
  const { isDragging, setNodeRef, transition, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    transition,
    opacity: isDragging ? 0.2 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell ref={setNodeRef} style={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};
