const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get all notes - GET "/api/notes/fetchallnotes" - Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error("❌ Error fetching notes:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 2: Add a new note - POST "/api/notes/addnote" - Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { title, description, tag } = req.body;
        const note = new Note({
            title, description, tag, user: req.user.id
        });

        const savedNote = await note.save();
        res.json({ success: true, note: savedNote });
    } catch (error) {
        console.error("❌ Error adding note:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 3: Update an existing note - PUT "/api/notes/updatenote/:id" - Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    try {
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, error: "Note not found" });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: "Not authorized" });
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ success: true, note });
    } catch (error) {
        console.error("❌ Error updating note:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 4: Delete a note - DELETE "/api/notes/deletenote/:id" - Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, error: "Note not found" });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: "Not authorized" });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Note has been deleted", note });
    } catch (error) {
        console.error("❌ Error deleting note:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
