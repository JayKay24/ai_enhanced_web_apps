import { render } from '@testing-library/react';

import ModelSelector from './ModelSelector';

describe('ModelSelector', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModelSelector />);
    expect(baseElement).toBeTruthy();
  });
});
