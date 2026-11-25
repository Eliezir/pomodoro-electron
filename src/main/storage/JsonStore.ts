import fs from 'node:fs';
import path from 'node:path';

/**
 * Keeps a value in a JSON file. Reads once, then serves from memory;
 * every write replaces the file through a temporary copy, so a crash in
 * the middle of a write never leaves half a file behind.
 */
export class JsonStore<T> {
  private cache: T | null = null;

  constructor(
    private readonly filePath: string,
    private readonly fallback: () => T,
  ) {}

  read(): T {
    if (this.cache) return this.cache;
    try {
      this.cache = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as T;
    } catch {
      // First run, or an unreadable file: start from the fallback.
      this.cache = this.fallback();
    }
    return this.cache;
  }

  write(value: T) {
    this.cache = value;
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
    fs.renameSync(tmp, this.filePath);
  }
}
