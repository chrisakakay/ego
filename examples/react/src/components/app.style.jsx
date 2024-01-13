import styled from 'styled-components';
import * as CONFIG from './configuration.jsx';

export const MainContent = styled.div`
  max-width: ${CONFIG.contentMaxWidth || 1000}px;
  min-height: 300px;
  margin: 50px auto;
  padding: 50px;
  box-sizing: border-box;
  border-radius: 3px;
  background-color: #FAFAFA;
  text-align: center;
`;
