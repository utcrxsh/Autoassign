import React, { useState } from 'react';
import './Dashboard.css';

const ALLOWED_FILE_TYPES = ['application/pdf'];
const API_BASE_URL = 'http://localhost:5000';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CreateAssignmentModal = ({ isOpen, onClose, onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    description: '',
    due_date: '',
    question_file: null,
    model_answer_file: null,
    sections: [] // Array of selected sections
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalId = 'create-assignment-modal';
  const titleId = `${modalId}-title`;

  // Available sections - in a real app, this might come from an API
  const availableSections = [
    { id: 'A', name: 'Section A' },
    { id: 'B', name: 'Section B' },
    { id: 'C', name: 'Section C' },
    { id: 'D', name: 'Section D' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        question_file: file
      }));
      setError('');
    } else {
      setError('Please upload a PDF file');
      e.target.value = '';
    }
  };

  const handleModelAnswerFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        model_answer_file: file
      }));
      setError('');
    } else {
      setError('Please upload a PDF file for the model answer');
      e.target.value = '';
    }
  };

  const handleSectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      sections: selectedOptions
    }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      setError('Assignment name must be at least 3 characters long');
      return false;
    }

    if (!formData.course) {
      setError('Course name is required');
      return false;
    }

    if (!formData.description || formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }

    if (!formData.due_date) {
      setError('Due date is required');
      return false;
    }

    if (!formData.sections || formData.sections.length === 0) {
      setError('Please select at least one section');
      return false;
    }

    if (!formData.question_file) {
      setError('Please upload a question file');
      return false;
    }

    if (!formData.model_answer_file) {
      setError('Please upload a model answer PDF');
      return false;
    }

    if (formData.model_answer_file && !ALLOWED_FILE_TYPES.includes(formData.model_answer_file.type)) {
      setError(`Invalid file type for model answer. Allowed types are: ${ALLOWED_FILE_TYPES.join(', ')}`);
      return false;
    }

    if (formData.model_answer_file && formData.model_answer_file.size > MAX_FILE_SIZE) {
      setError('Model answer file size exceeds 10MB limit');
      return false;
    }

    // Validate file type
    if (formData.question_file && !ALLOWED_FILE_TYPES.includes(formData.question_file.type)) {
      setError(`Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.join(', ')}`);
      return false;
    }

    // Validate file size (10MB)
    if (formData.question_file && formData.question_file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting assignment with data:', {
        name: formData.name,
        course: formData.course,
        description: formData.description,
        due_date: formData.due_date,
        file: formData.question_file ? {
          name: formData.question_file.name,
          type: formData.question_file.type,
          size: formData.question_file.size
        } : null,
        sections: formData.sections
      });

      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('course', formData.course.trim());
      data.append('description', formData.description.trim());
      data.append('due_date', formData.due_date);
      data.append('question_file', formData.question_file);
      data.append('model_answer_file', formData.model_answer_file);
      formData.sections.forEach(section => {
        data.append('sections[]', section);
      });

      const response = await fetch(`${API_BASE_URL}/api/assignments/create`, {
        method: 'POST',
        credentials: 'include',
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      const result = await response.json();
      console.log('Assignment created successfully:', result);
      onAssignmentCreated(result);
      onClose();

      // Reset form
      setFormData({
        name: '',
        course: '',
        description: '',
        due_date: '',
        question_file: null,
        model_answer_file: null,
        sections: []
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError(error.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay minimal-modal-overlay"
      role="dialog"
      aria-labelledby={titleId}
      aria-modal="true"
    >
      <div className="modal-content minimal-modal-content">
        <h2 id={titleId} className="modal-title">Create New Assignment</h2>
        <button
          type="button"
          className="close-button minimal-close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <form
          onSubmit={handleSubmit}
          noValidate
          encType="multipart/form-data"
          aria-busy={isSubmitting}
          className="minimal-form"
        >
          <div className="form-group minimal-form-group">
            <label htmlFor="name">Assignment Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter assignment name"
              className="minimal-input"
            />
          </div>

          <div className="form-group minimal-form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              placeholder="Enter course name"
              className="minimal-input"
            />
          </div>

          <div className="form-group minimal-form-group">
            <label htmlFor="sections">Sections</label>
            <select
              id="sections"
              name="sections"
              multiple
              value={formData.sections}
              onChange={handleSectionChange}
              className="section-select minimal-select"
            >
              {availableSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            <small className="help-text">Hold Ctrl/Cmd to select multiple sections</small>
          </div>

          <div className="form-group minimal-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter assignment description"
              rows="4"
              className="minimal-input"
            />
          </div>

          <div className="form-group minimal-form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className="minimal-input"
            />
          </div>

          <div className="form-group minimal-form-group">
            <label htmlFor="question_file">Question File (PDF only)</label>
            <input
              type="file"
              id="question_file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input minimal-input"
            />
          </div>

          <div className="form-group minimal-form-group">
            <label htmlFor="model_answer_file">Model Answer File (PDF only)</label>
            <input
              type="file"
              id="model_answer_file"
              accept=".pdf"
              onChange={handleModelAnswerFileChange}
              className="file-input minimal-input"
            />
          </div>

          {error && <div className="error-message minimal-error-message">{error}</div>}

          <div className="modal-actions minimal-modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cancel assignment creation"
              className="theme-btn minimal-btn minimal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Create assignment"
              className="theme-btn minimal-btn minimal-btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
