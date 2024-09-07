import React from 'react';
import { render, screen } from '@testing-library/react';
import Showcase from './Showcase';

test('renders the title', () => {
  render(<Showcase pageHeader='' pageSubtitle='' troveUrl='' collectionTitle='' showWantedCheckboxes={false}/>);
  const linkElement = screen.getByText(/Little Prince/);
  expect(linkElement).toBeInTheDocument();
});
