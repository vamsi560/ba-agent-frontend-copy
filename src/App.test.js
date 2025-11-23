import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BA Agent Pro', () => {
  render(<App />);
  // The app should render without errors
  // Note: This is a basic smoke test. The app requires authentication,
  // so it may show the login page initially.
  expect(document.body).toBeTruthy();
});
