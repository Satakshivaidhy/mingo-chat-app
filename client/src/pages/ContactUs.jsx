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
    <div className="flex-1 bg-gradient-to-br from-base-200 to-base-300 py-6 sm:py-12 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-lg text-base-content/70 max-w-xl mx-auto">
            Have questions or feedback? Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card bg-base-100 shadow-md border border-base-300/60"
          >
            <div className="card-body p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl mb-2">📧</div>
              <h2 className="card-title text-base sm:text-lg justify-center font-bold">Email</h2>
              <p className="text-xs sm:text-sm text-base-content/70">support@mingochat.com</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card bg-base-100 shadow-md border border-base-300/60"
          >
            <div className="card-body p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl mb-2">💬</div>
              <h2 className="card-title text-base sm:text-lg justify-center font-bold">Chat Support</h2>
              <p className="text-xs sm:text-sm text-base-content/70">Available 24/7 in App</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card bg-base-100 shadow-md border border-base-300/60"
          >
            <div className="card-body p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl mb-2">🌍</div>
              <h2 className="card-title text-base sm:text-lg justify-center font-bold">Location</h2>
              <p className="text-xs sm:text-sm text-base-content/70">Global Cloud Service</p>
            </div>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card bg-base-100 shadow-xl border border-base-300/60">
            <div className="card-body p-5 sm:p-8">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success shadow-lg mb-4 text-xs sm:text-sm">
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="alert alert-error shadow-lg mb-4 text-xs sm:text-sm">
                  <span>{errors.submit}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className={`input input-bordered w-full h-11 sm:h-12 text-sm ${errors.name ? 'input-error' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-error text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className={`input input-bordered w-full h-11 sm:h-12 text-sm ${errors.email ? 'input-error' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-error text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Subject Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="What is this about?"
                    className={`input input-bordered w-full h-11 sm:h-12 text-sm ${errors.subject ? 'input-error' : ''}`}
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.subject && (
                    <p className="text-error text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1">Message</label>
                  <textarea
                    className={`textarea textarea-bordered w-full h-28 sm:h-32 text-sm leading-relaxed ${errors.message ? 'textarea-error' : ''}`}
                    placeholder="Your message here..."
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isLoading}
                  ></textarea>
                  {errors.message && (
                    <p className="text-error text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-full min-h-[44px] font-bold mt-4 shadow-md text-sm sm:text-base"
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
  );
};

export default ContactUs;