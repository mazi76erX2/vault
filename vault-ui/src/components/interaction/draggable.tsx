import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DraggableItem {
  id: string;
  content: React.ReactNode;
}

export interface DraggableProps {
  items: DraggableItem[];
  onChange?: (items: DraggableItem[]) => void;
  className?: string;
  itemClassName?: string;
}

const SortableItem: React.FC<{
  id: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, children, className }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 bg-background border rounded-md",
        isDragging && "opacity-30",
        className,
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none focus:outline-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const Draggable: React.FC<DraggableProps> = ({
  items: initialItems,
  onChange,
  className,
  itemClassName,
}) => {
  const [items, setItems] = React.useState(initialItems);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Sync with prop changes
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(
          (item) => item.id === active.id,
        );
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        // Call onChange with new order
        onChange?.(newItems);

        return newItems;
      });
    }
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-2", className)}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} className={itemClassName}>
              {item.content}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div className="flex items-center gap-2 p-3 bg-background border rounded-md shadow-lg">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">{activeItem.content}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

Draggable.displayName = "Draggable";
