import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";

import { ColumnOrderState, Updater } from "@tanstack/react-table";

interface UseTableDraggableHeaderParams {
  columnOrder: string[];
  onReorder: (updater: Updater<ColumnOrderState>) => void;
}

export const useTableDraggableHeader = ({
  columnOrder,
  onReorder,
}: UseTableDraggableHeaderParams) => {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove<string>(columnOrder, oldIndex, newIndex); //this is just a splice util

      onReorder(newOrder);
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return { handleDragEnd, sensors };
};
