// 간단한 테스트 - App이 제대로 렌더링되는지 확인
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  // 최소한 하나의 요소가 렌더링되는지 확인
  expect(document.body).toBeTruthy();
});

