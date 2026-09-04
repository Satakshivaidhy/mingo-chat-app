import React, { useState } from 'react'
import { motion } from 'motion/react'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // Simulated submission delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccessMessage('Thank you for your message! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      setErrors({ submit: 'Failed to send message. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-base-content/60">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="card-title justify-center">Email</h2>
              <p className="text-base-content/70">support@mingochat.com</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body text-center">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="card-title justify-center">Chat Support</h2>
              <p className="text-base-content/70">Available 24/7</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h2 className="card-title justify-center">Location</h2>
              <p className="text-base-content/70">Global Support</p>
            </div>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card bg-base-100 shadow-2xl">
            <div className="card-body">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success shadow-lg mb-4">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="alert alert-error shadow-lg mb-4">
                  <div>
                    <span>{errors.submit}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className={`input input-bordered w-full transition-all ${errors.name ? 'input-error' : 'focus:input-primary'
                      }`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.name}</span>
                    </label>
                  )}
                </div>

                {/* Email Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className={`input input-bordered w-full transition-all ${errors.email ? 'input-error' : 'focus:input-primary'
                      }`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.email}</span>
                    </label>
                  )}
                </div>

                {/* Subject Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Subject</span>
                  </label>
                  <input
                    type="text"
                    placeholder="What is this about?"
                    className={`input input-bordered w-full transition-all ${errors.subject ? 'input-error' : 'focus:input-primary'
                      }`}
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.subject && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.subject}</span>
                    </label>
                  )}
                </div>

                {/* Message Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Message</span>
                  </label>
                  <textarea
                    className={`textarea textarea-bordered w-full h-32 transition-all ${errors.message ? 'textarea-error' : 'focus:textarea-primary'
                      }`}
                    placeholder="Your message here..."
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isLoading}
                  ></textarea>
                  {errors.message && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.message}</span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary w-full font-bold mt-6 ${isLoading ? 'loading' : ''
                    }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ContactUs