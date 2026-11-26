import { SlideContentTracker } from './SlideContentTracker';

describe('slide content tracking', () => {
  it('preserves the file when viewing normalizes markdown', () => {
    const tracker = new SlideContentTracker();
    const source = '* First item\n* Second item\n';
    const normalized = '- First item\n- Second item';
    tracker.load(source, '');
    tracker.observe(normalized, true);

    expect(tracker.hasChanges(normalized)).toBe(false);
    expect(tracker.contentToSave(normalized)).toBe(source);
    expect(tracker.contentToSave('- Edited item\n- Second item')).toBe(
      '- Edited item\n- Second item',
    );
  });

  it('preserves original formatting after undoing edits', () => {
    const tracker = new SlideContentTracker();
    tracker.load('Hello\n', 'Hello');
    tracker.observe('Hello world', false);
    expect(tracker.hasChanges('Hello world')).toBe(true);
    expect(tracker.contentToSave('Hello')).toBe('Hello\n');
  });

  it('does not carry edits across navigation, including identical slides', () => {
    const tracker = new SlideContentTracker();
    tracker.load('First slide', '');
    tracker.observe('First slide', true);
    expect(tracker.hasChanges('Edited slide')).toBe(true);

    tracker.load('Second slide\n', 'Edited slide');
    // Saving while the import is pending must also preserve the source.
    expect(tracker.contentToSave('Edited slide')).toBe('Second slide\n');
    tracker.observe('Second slide', true);
    expect(tracker.hasChanges('Second slide')).toBe(false);

    tracker.load('Second slide\n\n', 'Second slide');
    expect(tracker.contentToSave('Second slide')).toBe('Second slide\n\n');
  });

  it('keeps programmatic edits after loading, such as animation changes', () => {
    const tracker = new SlideContentTracker();
    tracker.load('Slide', '');
    tracker.observe('Slide', true);
    const animated = '---\nanimations: []\n---\nSlide';
    tracker.observe(animated, true);
    expect(tracker.contentToSave(animated)).toBe(animated);
  });
});
