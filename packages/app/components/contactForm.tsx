import {
  Button,
  Field,
  Form,
  FormError,
  FormWrapper,
} from "components/ui";
import React from "react";
import { useRouter } from "next/router";
import {
  WEBSITE_FORMS_PATH,
  submitWebsiteForm,
} from "../lib/formSubmission";

type ContactFormProps = {
  cta: string;
  successPath: string;
};

const ContactForm: React.FC<ContactFormProps> = ({ cta, successPath }) => {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const formStartedAt = React.useRef(String(Date.now()));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      await submitWebsiteForm(event.currentTarget);
      await router.push(successPath);
    } catch (error) {
      console.error(error);
      setSubmitError("Could not send your message. Please try again.");
    }
  };

  return (
    <FormWrapper>
      <Form
        formId="contact-form"
        name="contact"
        method="post"
        action={WEBSITE_FORMS_PATH}
        onSubmitCapture={handleSubmit}
        autoComplete="off"
      >
        <input
          aria-label="form name"
          type="hidden"
          name="form-name"
          value="contact"
        />
        <div hidden>
          <label htmlFor="bot-field">
            Don’t fill this out:{" "}
            <input aria-label="bot field" name="bot-field" />
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" />
          <input name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <input
          type="hidden"
          name="form-started-at"
          value={formStartedAt.current}
          readOnly
        />
        <Field name="name" required>
          Your name
        </Field>
        <Field name="email" required>
          Your email
        </Field>
        <Field name="message" required textarea>
          Your message
        </Field>
        <Button type="submit" styleType="primary" block>
          {cta}
        </Button>
        {submitError ? <FormError>{submitError}</FormError> : null}
      </Form>
    </FormWrapper>
  );
};
export default ContactForm;
