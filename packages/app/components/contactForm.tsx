import {
  Button,
  Field,
  Form,
  FormWrapper,
  Space,
  SubmitButton,
} from "@packages/design-system";
import React from "react";
import styled from "styled-components";

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
    <FormWrapper>
      <Form
        formId="contact-form"
        name="contact"
        method="post"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        action={action}
      >
        <input
          aria-label="form name"
          type="hidden"
          name="form-name"
          value="contact"
        />
        <p hidden>
          <label htmlFor="bot-field">
            Don’t fill this out:{" "}
            <input aria-label="bot field" name="bot-field" />
          </label>
        </p>
        <Field name="name" required ref={forwardRef}>
          Your name
        </Field>
        <Field name="email" required>
          Your email
        </Field>
        <Field name="message" required textarea>
          Your message
        </Field>
        <SubmitButton>
          <Button styleType="primary" block>
            {cta}
          </Button>
        </SubmitButton>
      </Form>
    </FormWrapper>
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
