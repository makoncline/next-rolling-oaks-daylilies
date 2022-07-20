import React from "react";
import styled from "styled-components";

export function Test({ children }: { children: React.ReactNode }) {
  return <Wrapper>{children}</Wrapper>;
}

const Wrapper = styled.div`
  color: red;
`;
