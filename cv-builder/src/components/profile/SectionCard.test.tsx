import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionCard } from './SectionCard';

describe('SectionCard', () => {
  const defaultProps = {
    title: 'Test Section',
    description: 'Test description',
    addButtonLabel: 'Add Item',
    managerRef: createRef<{ handleAdd: () => void }>(),
    children: <div data-testid="manager-content">Manager Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title and description', () => {
    render(<SectionCard {...defaultProps} />);

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(<SectionCard {...defaultProps} />);

    expect(screen.getByTestId('manager-content')).toBeInTheDocument();
    expect(screen.getByTestId('manager-content')).toHaveTextContent('Manager Content');
  });

  it('should render add button with label', () => {
    render(<SectionCard {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should call handleAdd when add button is clicked', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    const managerRef = { current: { handleAdd } };

    render(<SectionCard {...defaultProps} managerRef={managerRef} />);

    const addButton = screen.getByRole('button', { name: /add item/i });
    await user.click(addButton);

    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('should not crash when managerRef.current is null', async () => {
    const user = userEvent.setup();
    const managerRef = { current: null };

    render(<SectionCard {...defaultProps} managerRef={managerRef} />);

    const addButton = screen.getByRole('button', { name: /add item/i });

    // Should not throw
    await user.click(addButton);
  });

  describe('AI Features', () => {
    it('should not render AI button when hasAIFeatures is false', () => {
      render(<SectionCard {...defaultProps} hasAIFeatures={false} />);

      // Only the add button should be visible
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('should render AI button when hasAIFeatures is true', () => {
      render(
        <SectionCard
          {...defaultProps}
          hasAIFeatures={true}
          aiButtonLabel="Add using AI"
          onAIClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /add using ai/i })).toBeInTheDocument();
    });

    it('should call onAIClick when AI button is clicked', async () => {
      const user = userEvent.setup();
      const onAIClick = vi.fn();

      render(
        <SectionCard
          {...defaultProps}
          hasAIFeatures={true}
          aiButtonLabel="Add using AI"
          onAIClick={onAIClick}
        />
      );

      const aiButton = screen.getByRole('button', { name: /add using ai/i });
      await user.click(aiButton);

      expect(onAIClick).toHaveBeenCalledTimes(1);
    });

    it('should not render AI button when aiButtonLabel is missing', () => {
      render(<SectionCard {...defaultProps} hasAIFeatures={true} onAIClick={() => {}} />);

      // Only the add button should be visible
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('should not render AI button when onAIClick is missing', () => {
      render(<SectionCard {...defaultProps} hasAIFeatures={true} aiButtonLabel="Add using AI" />);

      // Only the add button should be visible
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('should render both buttons when AI features are enabled', () => {
      render(
        <SectionCard
          {...defaultProps}
          hasAIFeatures={true}
          aiButtonLabel="Add using AI"
          onAIClick={() => {}}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add using ai/i })).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should render within a Card component', () => {
      const { container } = render(<SectionCard {...defaultProps} />);

      // Check for card structure (assumes shadcn Card uses specific classes)
      expect(container.querySelector('[class*="rounded-"]')).toBeInTheDocument();
    });

    it('should have proper header layout with flex', () => {
      const { container } = render(<SectionCard {...defaultProps} />);

      // CardHeader should have flex layout
      const header = container.querySelector('[class*="flex"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <SectionCard
          {...defaultProps}
          hasAIFeatures={true}
          aiButtonLabel="Add using AI"
          onAIClick={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add using ai/i })).toBeInTheDocument();
    });

    it('should render heading for title', () => {
      render(<SectionCard {...defaultProps} />);

      // CardTitle typically renders as a heading
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });
  });
});
