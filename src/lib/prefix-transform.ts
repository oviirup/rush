import { Transform, TransformCallback } from 'stream';

export interface LabelConfig {
  enabled: boolean;
  width: number;
  lastPrefix: string | null;
  lastIsLinebreak?: boolean;
}

/**
 * Transform stream that adds prefixes to text content. Used for adding labels
 * or identifiers to output streams.
 *
 * @remarks
 *   Multiple instances can share the same output stream. The stream will add a
 *   prefix if the last output came from a different instance, using a shared
 *   state object to track this.
 * @private
 */
export class PrefixTransform extends Transform {
  private readonly prefix: string;
  private readonly state: LabelConfig;

  constructor(prefix: string, state: LabelConfig = {} as LabelConfig) {
    super();
    this.prefix = prefix;
    this.state = state;
  }

  /** Determines the initial prefix based on the current state */
  private getInitialPrefix(): string {
    if (this.state.lastIsLinebreak) {
      return this.prefix;
    }
    return this.state.lastPrefix !== this.prefix ? '\n' : '';
  }

  /**
   * Processes the chunk of data, adding prefixes where needed
   *
   * @param content - The content to transform
   * @returns The processed content with appropriate prefixes
   */
  private processContent(content: string | Buffer): string {
    const initialPrefix = this.getInitialPrefix();
    const newLinePrefix = `\n${this.prefix}`;

    // Convert Buffer to string if necessary
    const stringContent = Buffer.isBuffer(content)
      ? content.toString()
      : content;

    return `${initialPrefix}${stringContent}`.replace(/\n/g, newLinePrefix);
  }

  /**
   * Updates the state after processing content
   *
   * @param processedContent - The content after prefix processing
   */
  private updateState(processedContent: string): void {
    const lastPrefixIndex = processedContent.lastIndexOf(
      this.prefix,
      Math.max(0, processedContent.length - this.prefix.length),
    );

    this.state.lastPrefix = this.prefix;
    this.state.lastIsLinebreak = lastPrefixIndex !== -1;
  }

  _transform(
    chunk: string | Buffer,
    _encoding: string,
    callback: TransformCallback,
  ): void {
    const processedContent = this.processContent(chunk);
    const lastPrefixIndex = processedContent.lastIndexOf(
      this.prefix,
      Math.max(0, processedContent.length - this.prefix.length),
    );

    this.updateState(processedContent);

    // Only return content up to the last prefix if one is found
    const finalContent =
      lastPrefixIndex !== -1
        ? processedContent.slice(0, lastPrefixIndex)
        : processedContent;

    callback(null, finalContent);
  }
}
