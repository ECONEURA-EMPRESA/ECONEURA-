import { describe, it, expect } from 'vitest';
import { cx } from '../../utils/classnames';

describe('cx (classnames utility)', () => {
  it('concatena strings simples', () => {
    expect(cx('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('filtra valores falsy', () => {
    expect(cx('foo', false, 'bar', null, 'baz', undefined)).toBe('foo bar baz');
  });

  it('maneja condicionales', () => {
    const isActive = true;
    const isDisabled = false;
    
    expect(cx('base', isActive && 'active', isDisabled && 'disabled'))
      .toBe('base active');
  });

  it('retorna string vacío si solo falsy', () => {
    expect(cx(false, null, undefined)).toBe('');
  });

  it('maneja array vacío', () => {
    expect(cx()).toBe('');
  });

  it('maneja strings con espacios', () => {
    expect(cx('foo bar', 'baz qux')).toBe('foo bar baz qux');
  });
});


