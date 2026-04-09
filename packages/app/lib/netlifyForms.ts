const NETLIFY_FORMS_PATH = "/__forms.html";

const encodeNetlifyForm = (form: HTMLFormElement) => {
  const formData = new FormData(form);
  return new URLSearchParams(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
  ).toString();
};

const submitNetlifyForm = async (form: HTMLFormElement) => {
  const response = await fetch(NETLIFY_FORMS_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeNetlifyForm(form),
  });

  if (!response.ok) {
    throw new Error(
      `Netlify form submission failed with status ${response.status}`
    );
  }
};

export { NETLIFY_FORMS_PATH, submitNetlifyForm };
