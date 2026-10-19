import {
  DEFAULT_ONLOAD_NAME,
  DEFAULT_SCRIPT_ID,
  SCRIPT_URL,
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import Script from "next/script";
import { useState, type Ref } from "react";
import { env } from "../env";
import { FormError } from "./ui";

type FormVerificationProps = {
  action: "contact" | "cart";
  onVerifiedChange: (verified: boolean) => void;
  ref: Ref<TurnstileInstance | undefined>;
};

export function FormVerification({
  action,
  onVerifiedChange,
  ref,
}: FormVerificationProps) {
  const [hasError, setHasError] = useState(false);
  const handleError = () => {
    onVerifiedChange(false);
    setHasError(true);
  };

  return (
    <div className="my-4">
      <Script
        id={DEFAULT_SCRIPT_ID}
        src={`${SCRIPT_URL}?onload=${DEFAULT_ONLOAD_NAME}&render=explicit`}
        onError={handleError}
      />
      <Turnstile
        injectScript={false}
        ref={ref}
        siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        options={{ action, size: "flexible" }}
        onSuccess={() => {
          onVerifiedChange(true);
          setHasError(false);
        }}
        onExpire={() => onVerifiedChange(false)}
        onTimeout={() => onVerifiedChange(false)}
        onError={handleError}
        onUnsupported={handleError}
      />
      {hasError ? (
        <FormError>
          Could not complete verification. Check your connection and reload this
          page.
        </FormError>
      ) : null}
    </div>
  );
}
