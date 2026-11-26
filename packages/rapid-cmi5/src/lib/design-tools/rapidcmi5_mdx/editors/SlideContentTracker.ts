/** Preserve the source bytes when the editor only normalizes loaded markdown. */
export class SlideContentTracker {
  private source = '';
  private baseline = '';
  private loading = false;

  load(source: string, editorMarkdown: string) {
    this.source = source;
    this.baseline = editorMarkdown;
    // setMarkdown skips imports that differ only in surrounding whitespace.
    this.loading = source.trim() !== editorMarkdown.trim();
  }

  observe(markdown: string, isImport: boolean) {
    if (this.loading && isImport) {
      this.baseline = markdown;
      this.loading = false;
    }
  }

  hasChanges(markdown: string) {
    return !this.loading && markdown !== this.baseline;
  }

  contentToSave(markdown: string) {
    return this.hasChanges(markdown) ? markdown : this.source;
  }
}
