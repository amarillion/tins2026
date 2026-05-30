// Initial version generated with DeepSeek.

import { describe, it, expect } from 'vitest';
import { Tokenizer, TokenType } from './tokenizer';

describe('Tokenizer', () => {
	it('should tokenize a simple assignment with numbers', () => {
		const tokenizer = new Tokenizer('x = 5 + 3');
		const tokens = tokenizer.getAllTokens();
		
		expect(tokens).toHaveLength(6); // IDENTIFIER, ASSIGN, NUMBER, PLUS, NUMBER, EOF
		expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'x' });
		expect(tokens[1]).toMatchObject({ type: TokenType.ASSIGN });
		expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: 5 });
		expect(tokens[3]).toMatchObject({ type: TokenType.PLUS });
		expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: 3 });
		expect(tokens[5]).toMatchObject({ type: TokenType.EOF });
	});

	it('should tokenize negative numbers and floating point numbers', () => {
		const tokenizer = new Tokenizer('result = -3.14 * 2');
		const tokens = tokenizer.getAllTokens();
		
		expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'result' });
		expect(tokens[1]).toMatchObject({ type: TokenType.ASSIGN });
		expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: -3.14 });
		expect(tokens[3]).toMatchObject({ type: TokenType.MULTIPLY });
		expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: 2 });
	});

	it('should tokenize expressions with parentheses and functions', () => {
		const tokenizer = new Tokenizer('avg = (a + b) / 2');
		const tokens = tokenizer.getAllTokens();
		
		expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'avg' });
		expect(tokens[1]).toMatchObject({ type: TokenType.ASSIGN });
		expect(tokens[2]).toMatchObject({ type: TokenType.LPAREN });
		expect(tokens[3]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'a' });
		expect(tokens[4]).toMatchObject({ type: TokenType.PLUS });
		expect(tokens[5]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'b' });
		expect(tokens[6]).toMatchObject({ type: TokenType.RPAREN });
		expect(tokens[7]).toMatchObject({ type: TokenType.DIVIDE });
		expect(tokens[8]).toMatchObject({ type: TokenType.NUMBER, value: 2 });
	});

	it('should treat line endings as significant tokens', () => {
		const tokenizer = new Tokenizer('x = 5\ny = 10');
		const tokens = tokenizer.getAllTokens();
		
		// Find the LINE_END token
		const lineEndToken = tokens.find(t => t.type === TokenType.LINE_END);
		expect(lineEndToken).toBeDefined();
		expect(lineEndToken).toMatchObject({ type: TokenType.LINE_END });
		
		// Verify token sequence
		expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'x' });
		expect(tokens[1]).toMatchObject({ type: TokenType.ASSIGN });
		expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: 5 });
		expect(tokens[3]).toMatchObject({ type: TokenType.LINE_END });
		expect(tokens[4]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'y' });
		expect(tokens[5]).toMatchObject({ type: TokenType.ASSIGN });
		expect(tokens[6]).toMatchObject({ type: TokenType.NUMBER, value: 10 });
	});

	it('should tokenize a function call-like expression', () => {
		const tokenizer = new Tokenizer('max(10, 20)');
		const tokens = tokenizer.getAllTokens();
		
		expect(tokens).toHaveLength(7); // IDENTIFIER, LPAREN, NUMBER, COMMA, NUMBER, RPAREN, EOF
		expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'max' });
		expect(tokens[1]).toMatchObject({ type: TokenType.LPAREN });
		expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: 10 });
		expect(tokens[3]).toMatchObject({ type: TokenType.COMMA });
		expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: 20 });
		expect(tokens[5]).toMatchObject({ type: TokenType.RPAREN });
	});
});