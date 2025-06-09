import React, { useState, useEffect } from 'react'
import { X, Save, FileText, Trash2, Plus, Edit3 } from 'lucide-react'

interface NotesProps {
  isOpen: boolean
  onClose: () => void
}

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export function Notes({ isOpen, onClose }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Load notes from localStorage on component mount
  useEffect(() => {
    if (isOpen) {
      const savedNotes = localStorage.getItem('upcr-notes')
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }))
          setNotes(parsedNotes)
        } catch (error) {
          console.error('Error loading notes:', error)
        }
      }
    }
  }, [isOpen])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('upcr-notes', JSON.stringify(notes))
    }
  }, [notes])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setCurrentNote(newNote)
    setNoteTitle(newNote.title)
    setNoteContent(newNote.content)
    setIsEditing(true)
  }

  const selectNote = (note: Note) => {
    if (isEditing) {
      // If currently editing, ask for confirmation
      if (window.confirm('You have unsaved changes. Do you want to discard them?')) {
        setCurrentNote(note)
        setNoteTitle(note.title)
        setNoteContent(note.content)
        setIsEditing(false)
      }
    } else {
      setCurrentNote(note)
      setNoteTitle(note.title)
      setNoteContent(note.content)
      setIsEditing(false)
    }
  }

  const saveNote = () => {
    if (!currentNote) return

    const updatedNote: Note = {
      ...currentNote,
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent,
      updatedAt: new Date()
    }

    setNotes(prevNotes => {
      const existingIndex = prevNotes.findIndex(n => n.id === currentNote.id)
      if (existingIndex >= 0) {
        // Update existing note
        const newNotes = [...prevNotes]
        newNotes[existingIndex] = updatedNote
        return newNotes
      } else {
        // Add new note
        return [...prevNotes, updatedNote]
      }
    })

    setCurrentNote(updatedNote)
    setIsEditing(false)
  }

  const deleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId))
      if (currentNote?.id === noteId) {
        setCurrentNote(null)
        setNoteTitle('')
        setNoteContent('')
        setIsEditing(false)
      }
    }
  }

  const startEditing = () => {
    setIsEditing(true)
  }

  const cancelEditing = () => {
    if (currentNote) {
      setNoteTitle(currentNote.title)
      setNoteContent(currentNote.content)
    }
    setIsEditing(false)
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      if (event.key === 'Escape') {
        if (isEditing) {
          cancelEditing()
        } else {
          onClose()
        }
      } else if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        if (isEditing) {
          saveNote()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isEditing, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto h-[90vh] sm:h-[80vh] lg:h-[70vh] flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <h2 className="text-base sm:text-lg font-medium text-white">My Notes</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Close notes"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-full sm:w-80 bg-gray-50 border-b sm:border-r sm:border-b-0 border-gray-200 flex flex-col max-h-40 sm:max-h-none">
              {/* Search and New Note */}
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <button
                  onClick={createNewNote}
                  className="w-full mb-2 sm:mb-3 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  New Note
                </button>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? 'No notes match your search' : 'No notes yet. Create your first note!'}
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredNotes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => selectNote(note)}
                        className={`
                          p-3 mb-2 rounded-lg cursor-pointer transition-colors group
                          ${currentNote?.id === note.id 
                            ? 'bg-blue-100 border-2 border-blue-500' 
                            : 'hover:bg-gray-100 border-2 border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">
                              {note.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {note.content.substring(0, 80)}...
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDate(note.updatedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNote(note.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 transition-all"
                            aria-label="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col">
              {currentNote ? (
                <>
                  {/* Note Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="text-lg font-medium w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Note title..."
                        />
                      ) : (
                        <h3 className="text-lg font-medium text-gray-900">{currentNote.title}</h3>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(currentNote.createdAt)} | 
                        Last updated: {formatDate(currentNote.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveNote}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={startEditing}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="flex-1 p-4">
                    {isEditing ? (
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Start writing your note..."
                        className="w-full h-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <div className="w-full h-full">
                        {currentNote.content ? (
                          <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
                            {currentNote.content}
                          </pre>
                        ) : (
                          <div className="text-gray-500 italic">
                            This note is empty. Click Edit to add content.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No note selected</h3>
                    <p className="text-sm">Select a note from the sidebar or create a new one to get started.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 