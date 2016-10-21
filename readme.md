# prompt-skeleton

This project aims to bring a **consistent behavior to CLI apps**.

[![npm version](https://img.shields.io/npm/v/prompt-skeleton.svg)](https://www.npmjs.com/package/prompt-skeleton)
[![dependency status](https://img.shields.io/david/derhuerst/prompt-skeleton.svg)](https://david-dm.org/derhuerst/prompt-skeleton#info=dependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/prompt-skeleton.svg)

Instead of letting prompts parse user input by themselves, *prompt-skeleton* provides a [standard set of actions like `submit`](#actions), which prompts can hook into by exposing methods. The key bindings are based on [readline](https://de.wikipedia.org/wiki/GNU_readline).

Also, every prompt using *prompt-skeleton* will expose a [readable stream](http://jannis-mbp.local:57444/Dash/hjthuzjx/nodejs/api/stream.html#stream_class_stream_readable), emitting the current value after every user input.


## Prompts using *prompt-skeleton*

- [number-prompt](https://github.com/derhuerst/number-prompt)
- [date-prompt](https://github.com/derhuerst/date-prompt)
- [select-prompt](https://github.com/derhuerst/select-prompt)
- [multiselect-prompt](https://github.com/derhuerst/multiselect-prompt)
- [cli-autocomplete](https://github.com/derhuerst/cli-autocomplete)


## Installing

```
npm install prompt-skeleton
```


## Usage

```js
wrap(prompt)
```

To render to screen, [`write`](https://nodejs.org/Dash/hjthuzjx/nodejs/api/stream.html#stream_writable_write_chunk_encoding_callback) to `this.out`.

To emit both interim and final values, call `this.emit()`. The value in `this.value` will be emitted.

### Actions

You can process any of these actions by exposing a method `this[action]`.

- `first`/`last` – move to the first/last letter/digit
- `left`/`right`
- `up`/`down`
- `next` - for tabbing
- `delete` – remove letter/digit left to the cursor
- `space`
- `submit` – success, close the prompt
- `abort` – failure, close the prompt
- `reset`


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/prompt-skeleton/issues).
