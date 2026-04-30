import React from "react";
import Layout from "../components/layout";
import { useCart } from "components/cart";
import {
  Button,
  FancyHeading,
  Field,
  Form,
  FormError,
  FormWrapper,
  Hr,
  Space,
} from "components/ui";
import { useRouter } from "next/router";
import {
  WEBSITE_FORMS_PATH,
  submitWebsiteForm,
} from "../lib/formSubmission";

const CartTable = () => {
  const { addOne, removeOne, numItems, shipping, cart, total } = useCart();
  return (
    <>
      {numItems ? (
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Name</th>
              <th>Quantity</th>
              <th aria-label="quantity minus" />
              <th aria-label="quantity plus" />
              <th style={{ textAlign: "right" }}>Price/each</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8}>
                <Hr className="my-2" />
              </td>
            </tr>
            {cart &&
              cart.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "left" }}>{item.name}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td>
                    <Button
                      aria-label="quantity minus"
                      onClick={() => removeOne(item.id)}
                    >
                      -
                    </Button>
                  </td>
                  <td>
                    <Button
                      aria-label="quantity plus"
                      onClick={() => addOne(item.id)}
                    >
                      +
                    </Button>
                  </td>
                  <td style={{ textAlign: "right" }}>{`$${item.price}`}</td>
                </tr>
              ))}
            <tr className="total">
              <td className="wide pt-6" colSpan={4}>
                Shipping:
              </td>
              <td style={{ textAlign: "right" }}>{`$${shipping.toFixed(
                2
              )}`}</td>
            </tr>
            <tr className="total">
              <td className="wide" colSpan={4}>
                Total:
              </td>
              <td style={{ textAlign: "right" }}>{`$${total.toFixed(2)}`}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </>
  );
};

const CartForm = () => {
  const { numItems, shipping, cart, total } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [formStartedAt, setFormStartedAt] = React.useState("");

  React.useEffect(() => {
    setFormStartedAt(String(Date.now()));
  }, []);

  const cartText = () => {
    if (!numItems) return null;
    let items = "Cart:\n";
    items += cart.reduce(
      (message, item) =>
        (message += `(${item.quantity}) x ${item.name} @ $${item.price}/each\n`),
      ""
    );
    items += `Shipping: $${shipping.toFixed(2)}\n`;
    items += `Total: $${total.toFixed(2)}`;
    return items;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      await submitWebsiteForm(event.currentTarget);
      await router.push("/thanks");
    } catch (error) {
      console.error(error);
      setSubmitError(
        "Could not submit your availability request. Please try again."
      );
    }
  };

  return (
    <FormWrapper>
      <Form
        formId={"cart"}
        name="cart"
        method="post"
        action={WEBSITE_FORMS_PATH}
        onSubmitCapture={handleSubmit}
        hidden={numItems < 1}
        autoComplete="off"
      >
        <input
          aria-label="form name"
          type="hidden"
          name="form-name"
          value="cart"
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
          value={formStartedAt}
          readOnly
        />
        <Field name="name" required>
          Your name
        </Field>
        <Field name="email" required>
          Your email
        </Field>
        <div hidden>
          <Field name="cartText" textarea readOnly value={"" + cartText()}>
            Your cart
          </Field>
        </div>
        <Field name="message" textarea>
          Your message
        </Field>
        <Button type="submit" styleType="primary" block>
          Check availability
        </Button>
        {submitError ? <FormError>{submitError}</FormError> : null}
      </Form>
    </FormWrapper>
  );
};

const ClearButton = () => {
  const { clear, numItems } = useCart();
  return (
    <>
      {numItems > 0 && (
        <Button onClick={clear} danger>
          Empty Cart
        </Button>
      )}
    </>
  );
};

const Cart: React.FC = () => {
  return (
    <Layout>
      <Space direction="column" gap="large" center>
        <Space direction="column">
          <FancyHeading level={1}>Cart</FancyHeading>
          <p>
            Add items to your cart from any catalog. Enter your email, and a
            message if you like, to check for availability before proceeding
            with your order.
          </p>
        </Space>
        <CartTable />
        <CartForm />
        <ClearButton />
      </Space>
    </Layout>
  );
};

export default Cart;
