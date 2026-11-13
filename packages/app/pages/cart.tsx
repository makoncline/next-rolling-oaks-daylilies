import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Minus, Plus, X } from "lucide-react";
import { FormVerification } from "../components/formVerification";
import React from "react";
import Image from "next/image";
import { NoPhoto } from "../components/noPhoto";
import Layout from "../components/layout";
import { useCart } from "components/cart";
import {
  Button,
  cx,
  FancyHeading,
  Field,
  Form,
  FormError,
  FormWrapper,
  Spinner,
} from "components/ui";
import { useRouter } from "next/router";
import {
  WEBSITE_FORMS_PATH,
  submitWebsiteForm,
} from "../lib/formSubmission";
import { formatCurrency } from "../lib/format";
import { siteConfig } from "../siteConfig";

const CartTable = () => {
  const { addOne, removeOne, removeProduct, clear, numItems, shipping, cart, subTotal, total } =
    useCart();
  const belowMinimum = numItems > 0 && subTotal < siteConfig.minimumOrder;

  return (
    <>
      {numItems ? (
        <div className="w-full overflow-hidden rounded-lg border-stroke border-card-border bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-card-border px-5 py-2">
            <p className="m-0 text-meta text-muted-foreground">
              {numItems} {numItems === 1 ? "plant" : "plants"}
            </p>
            <button
              type="button"
              onClick={clear}
              className="min-h-control-compact cursor-pointer rounded-md bg-transparent px-2 text-meta font-medium text-destructive-text underline-offset-4 hover:underline"
            >
              Empty Cart
            </button>
          </div>
          <div className="flex flex-col divide-y divide-card-border">
            {cart.map((item) => (
              <article
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6"
                key={item.id}
              >
                <div className="flex min-w-0 grow items-center gap-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-tile">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="56px" className="object-cover" unoptimized />
                    ) : (
                      <NoPhoto title={item.name} size="thumb" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="m-0 text-tile-title font-semibold">{item.name}</h2>
                    <span className="text-meta text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${item.name}`}>
                    <Button
                      size="compact"
                      aria-label={`Remove One ${item.name}`}
                      onClick={() => removeOne(item.id)}
                    >
                      <Minus aria-hidden="true" className="shrink-0 size-4" />
                    </Button>
                    <span className="min-w-8 text-center font-semibold tabular-nums text-foreground-emphasis">
                      <span className="sr-only">Quantity: </span>
                      {item.quantity}
                    </span>
                    <Button
                      size="compact"
                      aria-label={`Add One ${item.name}`}
                      onClick={() => addOne(item.id)}
                    >
                      <Plus aria-hidden="true" className="shrink-0 size-4" />
                    </Button>
                  </div>
                  <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-foreground-emphasis">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="flex min-h-control-compact cursor-pointer items-center gap-1.5 self-start rounded-md bg-transparent px-2 text-meta text-muted-foreground hover:bg-secondary hover:text-foreground-emphasis sm:self-center"
                >
                  <X aria-hidden="true" className="shrink-0 size-4" />
                  <span className="sm:sr-only">Remove</span>
                </button>
              </article>
            ))}
          </div>
          <dl className="m-0 grid gap-2 border-t border-card-border bg-background-sunken px-5 py-4 text-foreground-emphasis">
            <div className="flex justify-between gap-4 text-meta">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="m-0 font-semibold tabular-nums">{formatCurrency(subTotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-meta">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="m-0 font-semibold tabular-nums">{formatCurrency(shipping)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-heading-4 font-bold">
              <dt>Total</dt>
              <dd className="m-0 tabular-nums">{formatCurrency(total)}</dd>
            </div>
            {belowMinimum && (
              <p className="m-0 mt-1 text-meta text-muted-foreground">
                Orders have a {formatCurrency(siteConfig.minimumOrder)} minimum,
                so this list is{" "}
                {formatCurrency(siteConfig.minimumOrder - subTotal)} short. You
                can still send it to ask about availability.
              </p>
            )}
          </dl>
        </div>
      ) : (
        <div className="flex w-full flex-col items-start gap-4 rounded-lg border-stroke border-card-border bg-card p-6">
          <p className="m-0 text-muted-foreground">Your cart is empty.</p>
          <div className="flex flex-wrap gap-3">
            <Button as="a" href="/catalog/for-sale" styleType="primary">
              Shop Daylilies for Sale
            </Button>
            <Button as="a" href="/catalogs">
              View Catalogs
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const CartForm = () => {
  const { numItems, shipping, cart, total, clear } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const verification = React.useRef<TurnstileInstance>(null);
  const [isVerified, setIsVerified] = React.useState(false);

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
    if (isSubmitting || !isVerified) return;
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
      setIsVerified(false);
      verification.current?.reset();
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
        {numItems > 0 ? (
          <FormVerification
            ref={verification}
            action="cart"
            onVerifiedChange={setIsVerified}
          />
        ) : null}
        <Button
          type="submit"
          styleType="primary"
          block
          disabled={isSubmitting || !isVerified}
        >
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

const Cart: React.FC = () => {
  const { numItems } = useCart();
  return (
    <Layout>
      <div className="flex flex-col gap-2">
        <FancyHeading level={1}>Cart</FancyHeading>
        {numItems > 0 && (
          <p className="m-0 text-muted-foreground">
            Nothing is charged here. Send me this list and I’ll confirm which
            plants are available and email you the final total. You pay
            afterward by check, PayPal or Venmo.
          </p>
        )}
      </div>
      <div
        className={cx(
          "grid w-full items-start gap-8",
          numItems > 0 ? "lg:grid-cols-12 lg:gap-10" : "max-w-prose"
        )}
      >
        <div className="flex flex-col items-start gap-4 lg:col-span-7">
          <CartTable />
        </div>
        <div className="w-full lg:col-span-5">
          <CartForm />
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
