import { useState } from 'react'

const TaskForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (formData.title.trim()) {
      onSubmit(formData)
      setFormData({ title: '', description: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title *"
          required
        />
      </div>
      <div className="form-group">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description (optional)"
          rows="3"
        />
      </div>
      <button type="submit" className="btn-submit">
        Add Task
      </button>
    </form>
  )
}

export default TaskForm
