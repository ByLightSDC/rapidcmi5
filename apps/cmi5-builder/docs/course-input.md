# Course inputs

## MkDocs conversion

Use `build <course-path> <player-dist> --convert` for a directory containing `mkdocs.yml` or `mkdocs.yaml`. The files named in `nav` must exist.

- A Markdown leaf becomes a slide.
- Its immediate named parent becomes an assignable unit (AU).
- Higher navigation labels become a block name, joined by a slash when nested.
- A leaf without a named parent uses the course title as its AU.

The builder writes `cmi5.xml` at the player distribution root and course files under `compiled_course/blocks/`. AUs sit directly in that folder; blocks are represented in `cmi5.xml`. Shared MkDocs assets go under `compiled_course/blocks/_assets/`. Only Markdown pages listed in `nav` become slides.

## Quizzes

Mark a quiz and its questions with HTML comments. MkDocs displays the original page; the builder turns the marked region into an interactive quiz and omits its answer key from the slide.

```md
<!-- rapid-cmi5:quiz id=practice title="Practice Quiz" passing-score=80 -->

<!-- rapid-cmi5:question id=q1 correct=B -->

1. **What is Greyspace?**
   A. The public Internet
   B. A synthetic Internet for training

## Answer Key

1. B

<!-- rapid-cmi5:quiz:end -->
```

Question IDs must be unique within the quiz, and each `correct` letter must match an option.

## MkDocs tabs

Consecutive `=== "Tab title"` sections become Rapid CMI5 tabs. Their Markdown and fenced code are kept. Enable `pymdownx.tabbed` in `mkdocs.yml` to render the tabs in MkDocs too.

## Existing RC5 courses

Omit `--convert` when the course directory already contains `RC5.yaml` and its referenced AU files:

```bash
npm run cmi5-builder:run -- --args="build ./my-rc5-course ./dist/apps/cc-cmi5-player --zip ./cmi5.zip"
```
