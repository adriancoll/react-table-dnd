import { CSSProperties } from "react";

import { DragHandleHorizontalIcon } from "@radix-ui/react-icons";
import { flexRender, Header } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "../ui/table";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  header: Header<TData, TValue>;
}

export function DataTableDraggableColumnHead<TData, TValue>({
  header,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id: header.column.id,
    data: {
      id: header.column.id,
      type: "column",
    },
    attributes: {
      roleDescription: "column",
    },
  });

  const isDraggable = !!header.column.columnDef.meta?.draggable;

  const DragButton = () => (
    <Button size="icon" variant="ghost" {...attributes} {...listeners}>
      <DragHandleHorizontalIcon className="h-4 w-4" />
    </Button>
  );

  const style: CSSProperties = isDraggable
    ? {
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
        transition,
        whiteSpace: "nowrap",
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0,
      }
    : {};

  if (!header.column.getCanSort()) {
    return (
      <TableHead
        key={header.id}
        colSpan={header.colSpan}
        style={style}
        ref={setNodeRef}
      >
        <div
          className={cn({
            "flex items-center gap-2": isDraggable,
          })}
        >
          {isDraggable && <DragButton />}
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </TableHead>
    );
  }

  return (
    <TableHead colSpan={header.colSpan} style={style} ref={setNodeRef}>
      <div
        className={cn({
          "flex items-center gap-2": isDraggable,
        })}
      >
        {isDraggable && <DragButton />}
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  );
}
