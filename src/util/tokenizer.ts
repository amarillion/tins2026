// Initial version generated with DeepSeek.

export enum TokenType {
	// Literals
	NUMBER = 'NUMBER',
	IDENTIFIER = 'IDENTIFIER',
	
	// Operators
	PLUS = 'PLUS',
	MINUS = 'MINUS',
	MULTIPLY = 'MULTIPLY',
	DIVIDE = 'DIVIDE',
	
	// Delimiters
	LPAREN = 'LPAREN',
	RPAREN = 'RPAREN',
	COMMA = 'COMMA',
	LINE_END = 'LINE_END',
	EOF = 'EOF',
	
	// Assignment
	ASSIGN = 'ASSIGN',
}

export interface Token {
	type: TokenType,
	value?: string | number,
	line: number,
	column: number,
}

export class Tokenizer {
	private input: string;
	private position: number;
	private line: number;
	private column: number;
	
	constructor(input: string) {
		this.input = input;
		this.position = 0;
		this.line = 1;
		this.column = 1;
	}
	
	private isDigit(char: string): boolean {
		return char >= '0' && char <= '9';
	}
	
	private isLetter(char: string): boolean {
		return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
	}
	
	private isWhitespace(char: string): boolean {
		return char === ' ' || char === '\t' || char === '\r';
	}
	
	private isLineEnd(char: string): boolean {
		return char === '\n';
	}
	
	private peek(): string {
		return this.position < this.input.length ? this.input[this.position] : '\0';
	}
	
	private advance(): string {
		const char = this.peek();
		this.position++;
		if (char === '\n') {
			this.line++;
			this.column = 1;
		} else {
			this.column++;
		}
		return char;
	}
	
	private readNumber(): Token {
		const startColumn = this.column;
		let value = '';
		let hasDecimal = false;
		
		// Handle negative numbers
		if (this.peek() === '-') {
			value += this.advance(); // consume '-'
		}
		
		while (this.position < this.input.length) {
			const char = this.peek();
			if (this.isDigit(char)) {
				value += this.advance();
			} else if (char === '.' && !hasDecimal) {
				hasDecimal = true;
				value += this.advance();
			} else {
				break;
			}
		}
		
		const numericValue = parseFloat(value);
		
		return {
			type: TokenType.NUMBER,
			value: numericValue,
			line: this.line,
			column: startColumn,
		};
	}
	
	private readIdentifier(): Token {
		const startColumn = this.column;
		let value = '';
		
		while (this.position < this.input.length) {
			const char = this.peek();
			if (this.isLetter(char) || this.isDigit(char)) {
				value += this.advance();
			} else {
				break;
			}
		}
		
		return {
			type: TokenType.IDENTIFIER,
			value,
			line: this.line,
			column: startColumn,
		};
	}
	
	private skipWhitespace(): void {
		while (this.position < this.input.length && this.isWhitespace(this.peek())) {
			this.advance();
		}
	}
	
	public getNextToken(): Token {
		this.skipWhitespace();
		
		if (this.position >= this.input.length) {
			return {
				type: TokenType.EOF,
				line: this.line,
				column: this.column,
			};
		}
		
		const char = this.advance();
		
		// Handle line endings
		if (this.isLineEnd(char)) {
			return {
				type: TokenType.LINE_END,
				line: this.line - 1, // line was incremented in advance()
				column: this.column - 1,
			};
		}
		
		// Handle numbers (including negative)
		if (this.isDigit(char) || (char === '-' && this.isDigit(this.peek()))) {
			// If it's a negative number, we need to backtrack and read it properly
			if (char === '-') {
				this.position--; // backtrack
				this.column--;
				return this.readNumber();
			}
			// Single digit or start of number
			this.position--; // backtrack
			this.column--;
			return this.readNumber();
		}
		
		// Handle identifiers
		if (this.isLetter(char)) {
			this.position--; // backtrack
			this.column--;
			return this.readIdentifier();
		}
		
		// Handle operators and delimiters
		switch (char) {
			case '+':
				return { type: TokenType.PLUS, line: this.line, column: this.column - 1 };
			case '-':
				return { type: TokenType.MINUS, line: this.line, column: this.column - 1 };
			case '*':
				return { type: TokenType.MULTIPLY, line: this.line, column: this.column - 1 };
			case '/':
				return { type: TokenType.DIVIDE, line: this.line, column: this.column - 1 };
			case '(':
				return { type: TokenType.LPAREN, line: this.line, column: this.column - 1 };
			case ')':
				return { type: TokenType.RPAREN, line: this.line, column: this.column - 1 };
			case '=':
				return { type: TokenType.ASSIGN, line: this.line, column: this.column - 1 };
			case ',':
				return { type: TokenType.COMMA, line: this.line, column: this.column - 1 };
			default:
				throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column - 1}`);
		}
	}
	
	public getAllTokens(): Token[] {
		const tokens: Token[] = [];
		let token = this.getNextToken();
		
		while (token.type !== TokenType.EOF) {
			tokens.push(token);
			token = this.getNextToken();
		}
		
		tokens.push(token); // Add EOF token
		return tokens;
	}
}
