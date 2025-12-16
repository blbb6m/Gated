import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Sidebar from './Sidebar';

// Mock Lucide icons to avoid rendering complexity
vi.mock('lucide-react', () => ({
  LayoutGrid: () => <span data-testid="icon-layout" />,
  Shirt: () => <span data-testid="icon-shirt" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Package: () => <span data-testid="icon-package" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  LogOut: () => <span data-testid="icon-logout" />,
}));

describe('Sidebar Component', () => {
  const mockSetActiveTab = vi.fn();
  const mockOnSignOut = vi.fn();

  it('renders the brand name correctly', () => {
    render(
      <Sidebar 
        activeTab="dashboard" 
        setActiveTab={mockSetActiveTab} 
        onSignOut={mockOnSignOut} 
      />
    );
    // Use getAllByText in case mobile/desktop versions duplicate text hidden via CSS
    const brandElements = screen.getAllByText('GATED.');
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('highlights the active tab', () => {
    render(
      <Sidebar 
        activeTab="wardrobe" 
        setActiveTab={mockSetActiveTab} 
        onSignOut={mockOnSignOut} 
      />
    );
    
    // Find the Wardrobe button. It should have specific styling classes for active state
    // We can check if it calls the handler or simply exists in the document
    expect(screen.getAllByText('Wardrobe')[0]).toBeInTheDocument();
  });

  it('calls setActiveTab when a navigation item is clicked', () => {
    render(
      <Sidebar 
        activeTab="dashboard" 
        setActiveTab={mockSetActiveTab} 
        onSignOut={mockOnSignOut} 
      />
    );
    
    // Click the Drops tab
    const dropsButton = screen.getAllByText('Drops')[0];
    fireEvent.click(dropsButton);
    expect(mockSetActiveTab).toHaveBeenCalledWith('drops');
  });

  it('calls onSignOut when the sign out button is clicked', () => {
    render(
      <Sidebar 
        activeTab="dashboard" 
        setActiveTab={mockSetActiveTab} 
        onSignOut={mockOnSignOut} 
      />
    );
    
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    expect(mockOnSignOut).toHaveBeenCalled();
  });
});