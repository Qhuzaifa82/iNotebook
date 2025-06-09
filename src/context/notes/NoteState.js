import React, { useState } from 'react';
import NoteContext from './noteContext';

const NoteState = (props) => {
  const host = "https://inotebook-backend-tyes.onrender.com";
  const [notes, setNotes] = useState([]);

  const clearNotes = () => {
    setNotes([]);
  };


  // Helper: Get a valid token
  const getValidToken = () => {
    const token = localStorage.getItem("token");
    return (typeof token === 'string' && token !== 'undefined') ? token : null;
  };

  // Get all notes
  const getNotes = async () => {
    const token = getValidToken();
    if (!token) {
      console.warn("Token not found or invalid. Skipping fetch.");
      return;
    }

    try {
      const response = await fetch(`${host}/api/notes/fetchallnotes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      const json = await response.json();
      if (Array.isArray(json)) {
        setNotes(json);
      } else {
        console.error("Invalid response format:", json);
        setNotes([]);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };



  // Add a note
  const addNote = async (title, description, tag) => {
    const token = getValidToken();
    if (!token) {
      console.warn("Token not found or invalid. Cannot add note.");
      return;
    }

    try {
      const response = await fetch(`${host}/api/notes/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ title, description, tag }),
      });

      const json = await response.json();

      if (response.ok && json.note) {
        setNotes(prevNotes => Array.isArray(prevNotes) ? [...prevNotes, json.note] : [json.note]);
      } else {
        console.error("Failed to add note:", json);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    const token = getValidToken();
    if (!token) {
      console.warn("Token not found or invalid. Cannot delete note.");
      return;
    }

    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      const json = await response.json();
      console.log("Note deleted:", json);

      setNotes(prevNotes =>
        Array.isArray(prevNotes) ? prevNotes.filter(note => note._id !== id) : []
      );
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Edit a note
  const editNote = async (id, title, description, tag) => {
    const token = getValidToken();
    if (!token) {
      console.warn("Token not found or invalid. Cannot edit note.");
      return;
    }

    try {
      const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ title, description, tag }),
      });

      const json = await response.json();
      console.log("Note updated:", json);

      setNotes(prevNotes => {
        if (!Array.isArray(prevNotes)) return [];
        return prevNotes.map(note =>
          note._id === id ? { ...note, title, description, tag } : note
        );
      });
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  return (
    <NoteContext.Provider value={{ notes, setNotes, addNote, deleteNote, editNote, getNotes, clearNotes }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
