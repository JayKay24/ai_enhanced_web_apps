import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WelcomeHeader from './WelcomeHeader';

describe('WelcomeHeader', () => {
  it('renders the title and subtitle correctly', () => {
    render(
      <WelcomeHeader
        emoji="✈️"
        emojiLabel="airplane"
        title="Test Title"
        subtitle="Test Subtitle"
      />
    );

    expect(screen.getByText(/Test Title/)).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders the emoji with the correct aria-label', () => {
    render(
      <WelcomeHeader
        emoji="✈️"
        emojiLabel="airplane"
        title="Test Title"
        subtitle="Test Subtitle"
      />
    );

    const emojiElement = screen.getByRole('img', { name: 'airplane' });
    expect(emojiElement).toBeInTheDocument();
    expect(emojiElement).toHaveTextContent('✈️');
  });
});
