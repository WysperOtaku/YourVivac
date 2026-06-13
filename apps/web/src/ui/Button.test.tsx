import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el texto', () => {
    render(<Button>Nueva salida</Button>);
    expect(screen.getByRole('button', { name: 'Nueva salida' })).toBeInTheDocument();
  });

  it('dispara onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ir</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Ir' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
