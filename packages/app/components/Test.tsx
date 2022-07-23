import React from "react";
import styled from "styled-components";
import { Space } from "@packages/design-system";

export function Test({ children }: { children: React.ReactNode }) {
  return (
    <Wrapper>
      <Space>{children}</Space>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  color: red;
`;
