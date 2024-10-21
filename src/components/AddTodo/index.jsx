import {
  addDatetime,
  addStringNoLocale,
  createThing,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
  addUrl,
} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import React, { useState } from "react";

const TEXT_PREDICATE = "http://schema.org/text";
const CREATED_PREDICATE = "http://www.w3.org/2002/12/cal/ical#created";
const TODO_CLASS = "http://www.w3.org/2002/12/cal/ical#Vtodo";
const TYPE_PREDICATE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

function AddTodo({ todoList, setTodoList }) {
  const { session } = useSession();
  const [todoText, setTodoText] = useState("");

  const addTodo = async (text) => {
    try {
      const indexUrl = getSourceUrl(todoList);
      const todoWithText = addStringNoLocale(
        createThing(),
        TEXT_PREDICATE,
        text
      );
      const todoWithDate = addDatetime(
        todoWithText,
        CREATED_PREDICATE,
        new Date()
      );
      const todoWithType = addUrl(todoWithDate, TYPE_PREDICATE, TODO_CLASS);
      const updatedTodoList = setThing(todoList, todoWithType);

      // Save the updated dataset to the user's Solid Pod
      const updatedDataset = await saveSolidDatasetAt(
        indexUrl,
        updatedTodoList,
        { fetch: session.fetch }
      );
      
      // Update the todo list in the state
      setTodoList(updatedDataset);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (todoText.trim()) {
      await addTodo(todoText);
      setTodoText(""); // Clear the input after adding a todo
    }
  };

  const handleChange = (e) => {
    setTodoText(e.target.value);
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label htmlFor="todo-input">
        <input
          id="todo-input"
          type="text"
          value={todoText}
          onChange={handleChange}
          placeholder="Enter a new to-do"
        />
      </label>
      <button className="add-button" type="submit" disabled={!todoText.trim()}>
        Add Todo
      </button>
    </form>
  );
}

export default AddTodo;
