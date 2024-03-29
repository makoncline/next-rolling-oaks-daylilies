import React from "react";
import Layout from "../components/layout";
import { useCart } from "components/cart";
import {
  Button,
  FancyHeading,
  Field,
  Form,
  FormWrapper,
  Heading,
  Hr,
  Space,
  SubmitButton,
} from "@packages/design-system";

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
                <Hr style={{ margin: "var(--size-2) 0 " }} />
              </td>
            </tr>
            {cart &&
              cart.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "left" }}>{item.name}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td className="btn">
                    <Button
                      aria-label="quantity minus"
                      onClick={() => removeOne(item.id)}
                    >
                      -
                    </Button>
                  </td>
                  <td className="btn">
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
              <td
                className="wide"
                colSpan={4}
                style={{ padding: "var(--size-6) 0 0" }}
              >
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

  return (
    <FormWrapper>
      <Form
        formId={"cart"}
        name="cart"
        method="post"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        action="/thanks"
        hidden={numItems < 1}
        autocomplete="off"
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
          <Field name="bot-field">bot-field</Field>
        </div>
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
        <SubmitButton>
          <Button type="submit" styleType="primary" block>
            Check availability
          </Button>
        </SubmitButton>
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
