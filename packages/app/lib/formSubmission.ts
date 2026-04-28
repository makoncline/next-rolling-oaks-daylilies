const WEBSITE_FORMS_PATH = "/api/forms";

const encodeWebsiteForm = (form: HTMLFormElement) => {
  const formData = new FormData(form);
  return new URLSearchParams(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
  ).toString();
};

const submitWebsiteForm = async (form: HTMLFormElement) => {
  const response = await fetch(WEBSITE_FORMS_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeWebsiteForm(form),
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with status ${response.status}`);
  }
};

export { WEBSITE_FORMS_PATH, submitWebsiteForm };
