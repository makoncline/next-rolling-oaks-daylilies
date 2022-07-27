import React from 'react';
import styled from 'styled-components';
import Button from './button';

type ContactFormProps = {
  action: string;
  cta: string;
  forwardRef: React.RefObject<HTMLInputElement>;
};

const ContactForm: React.FC<ContactFormProps> = ({
  action,
  cta,
  forwardRef,
}) => {
  return (
    <FormGroup>
      <form
        name='contact'
        method='post'
        data-netlify='true'
        data-netlify-honeypot='bot-field'
        action={action}
      >
        <input
          aria-label='form name'
          type='hidden'
          name='form-name'
          value='contact'
        />
        <p hidden>
          <label htmlFor='bot-field'>
            Don’t fill this out:{' '}
            <input aria-label='bot field' name='bot-field' />
          </label>
        </p>
        <label htmlFor='name'>Your name</label>
        <input
          aria-label='name'
          type='text'
          name='name'
          id='name'
          required
          ref={forwardRef}
        />
        <label htmlFor='email'>Your email</label>
        <input
          aria-label='email address'
          type='email'
          name='email'
          id='email'
          required
        />
        <label htmlFor='message'>Your message</label>
        <textarea aria-label='message' name='message' id='message' required />
        <Button
          className='button'
          type='submit'
          look='primary'
          fullWidth
          label='submit contact form'
        >
          {cta}
        </Button>
      </form>
    </FormGroup>
  );
};
export default ContactForm;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  label {
    display: inline-block;
    margin-bottom: 0.5rem;
  }
  input,
  textarea {
    width: 100%;
    margin: 0;
    margin-bottom: 15px;
    display: block;
    padding: 0.375rem 0.75rem;
    font-size: 1.3rem;
    line-height: 1.5;
    color: #55595c;
    background-color: #fff;
    background-image: none;
    border: 0.0625rem solid #ccc;
    border-radius: 7px;
  }
`;
