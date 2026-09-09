import { expect, test, describe } from 'vitest';
import { emailSchema, createUserSchema, clienteSchema } from '../validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    test('should validate correct emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('TEST@EXAMPLE.COM').data).toBe('test@example.com');
    });

    test('should reject invalid emails', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('').success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    test('should validate valid user payload', () => {
      const payload = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'securepassword123',
        oab: 'SP 123456',
      };
      expect(createUserSchema.safeParse(payload).success).toBe(true);
    });

    test('should reject too short passwords', () => {
      const payload = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123',
      };
      expect(createUserSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('clienteSchema', () => {
    test('should default to PF and empty observacoes', () => {
      const payload = {
        nome: 'Jane Doe',
        documento: '12345678901',
        email: 'jane@doe.com',
        telefone: '11999999999',
        cidade: 'São Paulo',
      };
      const result = clienteSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tipo).toBe('PF');
        expect(result.data.observacoes).toBe('');
      }
    });
  });
});
