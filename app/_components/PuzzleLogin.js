// components/PuzzleLogin.jsx
"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from "./PuzzleLogin.module.css";

const secretOrder = ["🔑", "🛡️", "⚙️", "🌟"];

function shuffle(arr) {
  return arr
    .map((v) => ({ sort: Math.random(), value: v }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
}

export default function PuzzleLogin({ onSuccess }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(shuffle(secretOrder));
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newList = Array.from(items);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);
    setItems(newList);
  };

  const checkAnswer = () => {
    if (items.join("") === secretOrder.join("")) {
      onSuccess();
    } else {
      alert("Wrong order. Try again.");
      setItems(shuffle(secretOrder));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Solve this puzzle to continue</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="puzzle" direction="horizontal">
            {(provided) => (
              <div
                className={styles.iconList}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {items.map((icon, idx) => (
                  <Draggable key={icon} draggableId={icon} index={idx}>
                    {(prov, snapshot) => (
                      <div
                        className={`${styles.icon} ${
                          snapshot.isDragging ? styles.iconDragging : ""
                        }`}
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                      >
                        {icon}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button className={styles.button} onClick={checkAnswer}>
          Verify
        </button>
      </div>
    </div>
  );
}
