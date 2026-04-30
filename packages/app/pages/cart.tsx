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
  Spinner,
} from "components/ui";
import { useRouter } from "next/router";
import {
  WEBSITE_FORMS_PATH,
  submitWebsiteForm,
} from "../lib/formSubmission";
import { formatCurrency } from "../lib/format";

const CartTable = () => {
  const { addOne, removeOne, numItems, shipping, cart, total } = useCart();
  const confirmAndRemove = (item: { id: string; name: string; quantity: number }) => {
    if (
      item.quantity > 1 ||
      window.confirm(`Remove ${item.name} from your cart?`)
    ) {
      removeOne(item.id);
    }
  };

  return (
    <>
      {numItems ? (
        <div className="w-full">
          <div className="grid gap-4 md:hidden">
            {cart.map((item) => (
              <article
                className="border-b border-ro-muted pb-4"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="m-0 text-lg">{item.name}</h2>
                  <strong className="shrink-0 text-ro-text-high">
                    {formatCurrency(item.price)}
                  </strong>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span>Quantity: {item.quantity}</span>
                  <Space gap="xsmall">
                    <Button
                      aria-label={`Remove One ${item.name}`}
                      onClick={() => confirmAndRemove(item)}
                    >
                      -
                    </Button>
                    <Button
                      aria-label={`Add One ${item.name}`}
                      onClick={() => addOne(item.id)}
                    >
                      +
                    </Button>
                  </Space>
                </div>
              </article>
            ))}
            <div className="grid gap-3 border-b border-ro-muted pb-4 text-ro-text-high">
              <div className="flex justify-between gap-4">
                <span>Shipping</span>
                <strong>{formatCurrency(shipping)}</strong>
              </div>
              <Hr className="my-1" />
              <div className="flex justify-between gap-4 text-xl">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
          </div>
          <table className="hidden w-full md:table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th>Quantity</th>
                <th colSpan={2}>
                  <span className="sr-only">Quantity Actions</span>
                </th>
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
                    <td className="max-w-52 break-words text-left">
                      {item.name}
                    </td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td>
                      <Button
                        aria-label={`Remove One ${item.name}`}
                        onClick={() => confirmAndRemove(item)}
                      >
                        -
                      </Button>
                    </td>
                    <td>
                      <Button
                        aria-label={`Add One ${item.name}`}
                        onClick={() => addOne(item.id)}
                      >
                        +
                      </Button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatCurrency(item.price)}
                    </td>
                  </tr>
                ))}
              <tr className="total">
                <td className="wide pt-6" colSpan={4}>
                  Shipping:
                </td>
                <td style={{ textAlign: "right" }}>
                  {formatCurrency(shipping)}
                </td>
              </tr>
              <tr className="total">
                <td className="wide" colSpan={4}>
                  Total:
                </td>
                <td style={{ textAlign: "right" }}>{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};

const CartForm = () => {
  const { numItems, shipping, cart, total, clear } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formStartedAt = React.useRef(String(Date.now()));

  const cartText = () => {
    if (!numItems) return null;
    let items = "Cart:\n";
    items += cart.reduce(
      (message, item) =>
        (message += `(${item.quantity}) x ${item.name} @ ${formatCurrency(
          item.price
        )}/each\n`),
      ""
    );
    items += `Shipping: ${formatCurrency(shipping)}\n`;
    items += `Total: ${formatCurrency(total)}`;
    return items;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await submitWebsiteForm(event.currentTarget);
      clear();
      await router.push("/thanks");
    } catch (error) {
      console.error(error);
      setSubmitError(
        "Could not submit your availability request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
          readOnly
        />
        <div hidden>
          <label htmlFor="bot-field">
            Don’t fill this out:{" "}
            <input id="bot-field" aria-label="bot field" name="bot-field" />
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
        <div hidden>
          <Field name="cartText" textarea readOnly value={"" + cartText()}>
            Your cart
          </Field>
        </div>
        <Field name="message" textarea autoComplete="off">
          Your message
        </Field>
        <Button type="submit" styleType="primary" block disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              Checking Availability…
            </>
          ) : (
            "Check Availability"
          )}
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
        <Button
          onClick={() => {
            if (window.confirm("Empty all items from your cart?")) {
              clear();
            }
          }}
          danger
        >
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
