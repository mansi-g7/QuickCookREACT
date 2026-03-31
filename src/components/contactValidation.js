export const initialContactFormData = {
  fullName: '',
  email: '',
  subject: 'General Inquiry',
  message: ''
};

export const validateContactForm = (formData) => {
  const errors = {};
  const fullName = formData.fullName.trim();
  const email = formData.email.trim();
  const message = formData.message.trim();

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!formData.subject) {
    errors.subject = 'Please select a subject.';
  }

  if (!message) {
    errors.message = 'Message is required.';
  } else if (message.length < 15) {
    errors.message = 'Message must be at least 15 characters.';
  }

  return errors;
};
