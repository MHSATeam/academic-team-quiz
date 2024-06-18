// Adapated from https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx
// Accessed: 4/6/24

import { StepComponentProps } from "@/components/pages/management/UploadSet";
import QuestionDisplay from "@/components/upload/uploading/QuestionDisplay";
import { QuestionList } from "@/src/utils/set-upload-utils";
import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  MouseSensor,
  UniqueIdentifier,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type SetContextProps = Omit<StepComponentProps, "categories"> & {
  children: ReactNode;
};

export default function SetContext(props: SetContextProps) {
  const { context } = props.state;
  const [activeId, setActiveId] = useState<string | null>(null);

  const [clonedQuestionLists, setClonedQuestionLists] = useState<
    QuestionList[] | null
  >(null);

  const activeData = useMemo(
    () => context.questions.find((q) => q.id === activeId),
    [activeId, context.questions],
  );

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        const questionList = context.questionLists.find(
          (qList) => qList.id === overId,
        );
        if (questionList) {
          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (questionList.questions.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  questionList.questions.includes(container.id as string),
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, context.questionLists],
  );

  const findContainer = (id: string) => {
    return context.questionLists.find(
      (qList) => qList.id === id || qList.questions.includes(id),
    );
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [context.questionLists]);
  const sensors = useSensors(useSensor(MouseSensor));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={({ active }) => {
        setActiveId(active.id as string);
        setClonedQuestionLists(context.questionLists);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id as string;

        if (overId == null) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id as string);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          const activeItems = activeContainer.questions;
          const overItems = overContainer.questions;
          const overIndex = overItems.indexOf(overId);
          const activeIndex = activeItems.indexOf(active.id as string);

          let newIndex: number;

          if (
            context.questionLists.findIndex((qList) => qList.id === overId) !==
            -1
          ) {
            newIndex = overItems.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex =
              overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          }

          recentlyMovedToNewContainer.current = true;
          requestAnimationFrame(() => {
            props.send({
              type: "updateQuestionLists",
              params: {
                questionLists: [
                  {
                    id: overContainer.id,
                    questions: [
                      ...overContainer.questions.slice(0, newIndex),
                      activeContainer.questions[activeIndex],
                      ...overContainer.questions.slice(
                        newIndex,
                        overContainer.questions.length,
                      ),
                    ],
                  },
                  {
                    id: activeContainer.id,
                    questions: activeContainer.questions.filter(
                      (item) => item !== active.id,
                    ),
                  },
                ],
              },
            });
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        const activeContainer = findContainer(active.id as string);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id as string;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = activeContainer.questions.indexOf(
            active.id as string,
          );
          const overIndex = overContainer.questions.indexOf(overId);

          if (activeIndex !== overIndex) {
            props.send({
              type: "updateQuestionLists",
              params: {
                questionLists: [
                  {
                    id: overContainer.id,
                    questions: arrayMove(
                      overContainer.questions,
                      activeIndex,
                      overIndex,
                    ),
                  },
                ],
              },
            });
          }
        }

        setActiveId(null);
      }}
      onDragCancel={() => {
        if (clonedQuestionLists) {
          props.send({
            type: "updateQuestionLists",
            params: {
              questionLists: clonedQuestionLists,
            },
          });
        }
        setActiveId(null);
        setClonedQuestionLists(null);
      }}
    >
      {props.children}
      {createPortal(
        <DragOverlay>
          {activeData ? (
            <QuestionDisplay questionData={activeData} dragOverlay />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}
