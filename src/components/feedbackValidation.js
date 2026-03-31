export const initialFeedbackFormData = {
  name: '',
  email: '',
  rating: '',
  message: ''
};

export const validateFeedbackForm = (formData) => {
  const errors = {};
  const name = formData.name.trim();
  const email = formData.email.trim();
  const message = formData.message.trim();

  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!formData.rating) {
    errors.rating = 'Please select a rating.';
  }

  if (!message) {
    errors.message = 'Message is required.';
  } else if (message.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return errors;
};
