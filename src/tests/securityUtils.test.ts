
import { sanitizeHtml, sanitizeInput, isValidEmail, validatePasswordStrength } from '../utils/securityUtils';

describe('Security Utils', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<p>Hello</p>');
      expect(result).not.toContain('script');
    });

    it('should remove iframe tags', () => {
      const input = '<p>Content</p><iframe src="javascript:alert(\'XSS\')"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<p>Content</p>');
      expect(result).not.toContain('iframe');
    });

    it('should remove event handlers', () => {
      const input = '<img src="image.jpg" onerror="alert(\'XSS\')">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onerror');
    });

    it('should preserve safe HTML', () => {
      const input = '<p>Hello <strong>world</strong>!</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<p>Hello <strong>world</strong>!</p>');
    });

    it('should handle empty and invalid input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("test")</script>';
      const result = sanitizeInput(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle special characters', () => {
      const input = "It's a \"test\" with <tags> & /slashes/";
      const result = sanitizeInput(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test..test@domain.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('MyStr0ng!Pass');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(3);
    });

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect common patterns', () => {
      const result = validatePasswordStrength('Password123');
      expect(result.errors.some(e => e.includes('sequências'))).toBe(true);
    });
  });
});
