import React from "react";
import styled from "styled-components";
import Layout from "../components/layout";
import Button from "../components/button";
import Head from "../components/head";
import Container from "../components/container";
import { useCart } from "components/cart";

const Header = () => (
  <Head
    title="Cart"
    description="Add items to your cart from any catalog. Enter your email, and a message if you like, to check for availability before proceeding with your order."
    id="head"
  />
);

const CartTable = () => {
  const { addOne, removeOne, numItems, shipping, cart, total } = useCart();
  return (
    <Table>
      {numItems ? (
        <table>
          <thead>
            <tr>
              <th className="left">Name</th>
              <th>Quantity</th>
              <th aria-label="quantity minus" />
              <th aria-label="quantity plus" />
              <th className="right">Price/each</th>
            </tr>
          </thead>
          <tbody>
            {cart &&
              cart.map((item, i) => (
                <tr key={i}>
                  <td className="name">{item.name}</td>
                  <td className="qty">{item.quantity}</td>
                  <td className="btn">
                    <button
                      aria-label="quantity minus"
                      onClick={() => removeOne(item.id)}
                    >
                      -
                    </button>
                  </td>
                  <td className="btn">
                    <button
                      aria-label="quantity plus"
                      onClick={() => addOne(item.id)}
                    >
                      +
                    </button>
                  </td>
                  <td className="price">{`$${item.price}`}</td>
                </tr>
              ))}
            <tr className="total">
              <td className="wide" colSpan={4}>
                Shipping:
              </td>
              <td className="price">{`$${shipping.toFixed(2)}`}</td>
            </tr>
            <tr className="total">
              <td className="wide" colSpan={4}>
                Total:
              </td>
              <td className="price">{`$${total.toFixed(2)}`}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </Table>
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
    <Form>
      {numItems > 0 && (
        <form
          name="cart"
          method="post"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          action="/thanks"
          hidden={numItems < 1}
        >
          <input
            aria-label="form name"
            type="hidden"
            name="form-name"
            value="cart"
          />
          <p hidden>
            <label htmlFor="bot-field">
              Don’t fill this out:{" "}
              <input aria-label="bot field" name="bot-field" />
            </label>
          </p>
          <label htmlFor="email">Your email</label>
          <input
            aria-label="email address"
            type="email"
            name="email"
            id="email"
            required
          />
          <p hidden>
            <label htmlFor="cartText">Your cart</label>
            <textarea
              aria-label="cart text"
              name="cartText"
              id="cartText"
              value={"" + cartText()}
              readOnly
            />
          </p>
          <label htmlFor="message">Your message</label>
          <textarea aria-label="message" name="message" id="message" />
          <Button
            className="button"
            type="submit"
            look="primary"
            fullWidth
            label="check availability"
          >
            Check availability
          </Button>
        </form>
      )}
    </Form>
  );
};

const ClearButton = () => {
  const { clear, numItems } = useCart();
  return (
    <>
      {numItems > 0 && (
        <>
          <br />
          <a
            href="#head"
            style={{
              display: "block",
              margin: "auto",
              textAlign: "center",
              width: "200px",
            }}
            onClick={clear}
          >
            Empty Cart
          </a>
        </>
      )}
    </>
  );
};

const Cart: React.FC = () => {
  return (
    <Style>
      <Layout>
        <Container
          head={<Header />}
          content={
            <div className="center">
              <CartTable />
              <CartForm />
              <ClearButton />
            </div>
          }
        />
      </Layout>
    </Style>
  );
};

export default Cart;

const Style = styled.div`
  .center {
    display: block;
    margin: auto;
    max-width: 35rem;
  }
`;
const Table = styled.div`
  overflow-x: scroll;
  table {
    width: 100%;
    border-collapse: collapse;
    th {
      padding: 0.5rem 0 0.5rem 0;
      border-bottom: 1px solid var(--bg-2);
    }
    tr:nth-last-child(2) {
      border-top: 1px solid var(--bg-2);
    }
    td {
      vertical-align: top;
      padding: 0.5rem 0 0.5rem 0;
    }
    tr:nth-child(even) {
      background-color: var(--bg-2);
    }
    .label {
      text-align: right;
      width: 7rem;
    }
    .value {
      padding-left: 1rem;
    }
  }
  .qty {
    text-align: center;
  }
  .wide,
  .price {
    text-align: right;
  }
  .left {
    text-align: left;
    min-width: 150px;
  }
  .right {
    text-align: right;
  }
  .total td {
    background-color: var(--bg-4);
  }
  .btn {
    padding-left: 5px;
  }
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-4);
    border: 1px solid rgb(var(--rgb-blue));
    outline: none;
    color: rgb(var(--rgb-blue));
    border-radius: 3rem;
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    &:hover {
      background-color: var(--bg-shine);
    }
    &:focus {
      outline: none;
    }
    &:active {
      transform: scale(0.95);
      outline: none;
    }
  }
`;

const Form = styled.div`
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
