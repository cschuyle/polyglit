import React from 'react';
import { render, screen } from '@testing-library/react';
import Showcase from './Showcase';

test('renders search and edition summary', () => {
  render(<Showcase
      // pageHeader='' pageSubtitle=''
      troveUrl='' collectionTitle='' showWantedCheckboxes={false}/>);
  expect(screen.getByPlaceholderText(/language, country/)).toBeInTheDocument();
  expect(screen.getByText(/editions of/)).toBeInTheDocument();
});
