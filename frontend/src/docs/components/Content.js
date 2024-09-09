// src/components/Content.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import remarkGfm from 'remark-gfm';

const ContentContainer = styled.div`
  margin-left: ${(props) => (props.sidebarOpen ? '280px' : '30px')};
  padding: 20px;
  max-width: 800px;
  transition: margin-left 0.3s;

  @media (max-width: 768px) {
    margin-left: ${(props) => (props.sidebarOpen ? '220px' : '10px')};
    padding: 10px;
  }
`;

const Content = ({ markdown, sidebarOpen }) => {
    return (
        <ContentContainer sidebarOpen={sidebarOpen}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
            </ReactMarkdown>
        </ContentContainer>
    );
};

export default Content;