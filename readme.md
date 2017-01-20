# prompt-skeleton

This project aims to bring a **consistent behavior to CLI apps**.

[![npm version](https://img.shields.io/npm/v/prompt-skeleton.svg)](https://www.npmjs.com/package/prompt-skeleton)
[![dependency status](https://img.shields.io/david/derhuerst/prompt-skeleton.svg)](https://david-dm.org/derhuerst/prompt-skeleton#info=dependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/prompt-skeleton.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)

Instead of letting prompts parse user input by themselves, *prompt-skeleton* provides a [standard set of actions like `submit`](#actions), which prompts can act on by exposing methods. The key bindings are [readline](https://de.wikipedia.org/wiki/GNU_readline)-inspired.

Also, every prompt using *prompt-skeleton* will expose a [readable stream](http://jannis-mbp.local:57444/Dash/hjthuzjx/nodejs/api/stream.html#stream_class_stream_readable), emitting the current value after every user input as well as an `submit` or `abort` event.


## Prompts using *prompt-skeleton*

- [`date-prompt`](https://github.com/derhuerst/date-prompt)
- [`mail-prompt`](https://github.com/derhuerst/mail-prompt)
- [`multiselect-prompt`](https://github.com/derhuerst/multiselect-prompt)
- [`number-prompt`](https://github.com/derhuerst/number-prompt)
- [`range-prompt`](https://github.com/derhuerst/range-prompt)
- [`select-prompt`](https://github.com/derhuerst/select-prompt)
- [`text-prompt`](https://github.com/derhuerst/text-prompt)
- [`tree-select-prompt`](https://github.com/derhuerst/tree-select-prompt)
- [`cli-autocomplete`](https://github.com/derhuerst/cli-autocomplete)
- [`switch-prompt`](https://github.com/derhuerst/switch-prompt)


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

### Example

This renders a prompt that lets you pick a number.

```js
const wrap = require('prompt-skeleton')

const prompt = wrap({
	value: 0,
	up: function () {
		this.value++
		this.emit() // send `data` event
		this.out.write(this.value + '\n') // render to `stdout`
	},
	down: function () {
		this.value--
		this.emit() // send `data` event
		this.out.write(this.value + '\n') // render to `stdout`
	}
})

prompt
.on('submit', (value) => {
	// do something with the value
})
.on('abort', (value) => {
	// do something with the value
})
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/prompt-skeleton/issues).
