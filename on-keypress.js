'use strict'

const StringDecoder = require('string_decoder').StringDecoder



const keypress = (stream, cb) => {
	const decoder = new StringDecoder('utf8')
	const onData = (data) => cb(parse(decoder.write(data), stream.encoding))

	const oldRawMode = stream.isRaw
	stream.setRawMode(true)
	stream.on('data', onData)
	stream.resume()

	return () => {
		stream.setRawMode(oldRawMode)
		stream.pause()
		stream.removeListener('data', onData)
	}
}



// Stolen from the `keypress` module.
// https://github.com/TooTallNate/keypress/blob/476a519/index.js#L174-L408
const parse = (s, enc) => {
	var ch, parts, key = {
		  name:     undefined
		, ctrl:     false
		, meta:     false
		, shift:    false
		, sequence: s
	}

	if (Buffer.isBuffer(s)) {
		if (s[0] > 127 && s[1] === undefined) {
			s[0] -= 128;
			s = '\x1b' + s.toString(enc || 'utf-8')
		} else s = s.toString(enc || 'utf-8')
	}

	if (s === '\r') { // carriage return
		key.name = 'return'
	} else if (s === '\n') { // enter, should have been called linefeed
		key.name = 'enter'
	} else if (s === '\t') { // tab
		key.name = 'tab'
	} else if (s === '\b' || s === '\x7f' ||
		s === '\x1b\x7f' || s === '\x1b\b') { // backspace or ctrl+h
		key.name = 'backspace'
		key.meta = (s.charAt(0) === '\x1b')
	} else if (s === '\x1b' || s === '\x1b\x1b') { // escape key
		key.name = 'escape'
		key.meta = (s.length === 2)
	} else if (s === ' ' || s === '\x1b ') { // space
		key.name = 'space';
		key.meta = (s.length === 2);
	} else if (s <= '\x1a') { // ctrl+letter
		key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1)
		key.ctrl = true
	} else if (s.length === 1 && s >= 'a' && s <= 'z') { // lowercase letter
		key.name = s
	} else if (s.length === 1 && s >= 'A' && s <= 'Z') { // shift+letter
		key.name = s.toLowerCase()
		key.shift = true
	} else if (parts = metaKeyCodeRe.exec(s)) { // meta+character key
		key.name = parts[1].toLowerCase()
		key.meta = true
		key.shift = /^[A-Z]$/.test(parts[1])
	} else if (parts = functionKeyCodeRe.exec(s)) { // ansi escape sequence
		// reassemble the key code leaving out leading \x1b's,
		// the modifier key bitflag and any meaningless "1;" sequence
		let code = (parts[1] || '') + (parts[2] || '') + (parts[4] || '') + (parts[6] || '')
		let modifier = (parts[3] || parts[5] || 1) - 1

		// Parse the key modifier
		key.ctrl = !!(modifier & 4)
		key.meta = !!(modifier & 10)
		key.shift = !!(modifier & 1)
		key.code = code

		// Parse the key itself
		switch (code) {
			/* xterm/gnome ESC O letter */
			case 'OP': key.name = 'f1'; break
			case 'OQ': key.name = 'f2'; break
			case 'OR': key.name = 'f3'; break
			case 'OS': key.name = 'f4'; break

			/* xterm/rxvt ESC [ number ~ */
			case '[11~': key.name = 'f1'; break
			case '[12~': key.name = 'f2'; break
			case '[13~': key.name = 'f3'; break
			case '[14~': key.name = 'f4'; break

			/* from Cygwin and used in libuv */
			case '[[A': key.name = 'f1'; break
			case '[[B': key.name = 'f2'; break
			case '[[C': key.name = 'f3'; break
			case '[[D': key.name = 'f4'; break
			case '[[E': key.name = 'f5'; break

			/* common */
			case '[15~': key.name = 'f5'; break
			case '[17~': key.name = 'f6'; break
			case '[18~': key.name = 'f7'; break
			case '[19~': key.name = 'f8'; break
			case '[20~': key.name = 'f9'; break
			case '[21~': key.name = 'f10'; break
			case '[23~': key.name = 'f11'; break
			case '[24~': key.name = 'f12'; break

			/* xterm ESC [ letter */
			case '[A': key.name = 'up'; break
			case '[B': key.name = 'down'; break
			case '[C': key.name = 'right'; break
			case '[D': key.name = 'left'; break
			case '[E': key.name = 'clear'; break
			case '[F': key.name = 'end'; break
			case '[H': key.name = 'home'; break

			/* xterm/gnome ESC O letter */
			case 'OA': key.name = 'up'; break
			case 'OB': key.name = 'down'; break
			case 'OC': key.name = 'right'; break
			case 'OD': key.name = 'left'; break
			case 'OE': key.name = 'clear'; break
			case 'OF': key.name = 'end'; break
			case 'OH': key.name = 'home'; break

			/* xterm/rxvt ESC [ number ~ */
			case '[1~': key.name = 'home'; break
			case '[2~': key.name = 'insert'; break
			case '[3~': key.name = 'delete'; break
			case '[4~': key.name = 'end'; break
			case '[5~': key.name = 'pageup'; break
			case '[6~': key.name = 'pagedown'; break

			/* putty */
			case '[[5~': key.name = 'pageup'; break
			case '[[6~': key.name = 'pagedown'; break

			/* rxvt */
			case '[7~': key.name = 'home'; break
			case '[8~': key.name = 'end'; break

			/* rxvt keys with modifiers */
			case '[a': key.name = 'up'; key.shift = true; break
			case '[b': key.name = 'down'; key.shift = true; break
			case '[c': key.name = 'right'; key.shift = true; break
			case '[d': key.name = 'left'; key.shift = true; break
			case '[e': key.name = 'clear'; key.shift = true; break

			case '[2$': key.name = 'insert'; key.shift = true; break
			case '[3$': key.name = 'delete'; key.shift = true; break
			case '[5$': key.name = 'pageup'; key.shift = true; break
			case '[6$': key.name = 'pagedown'; key.shift = true; break
			case '[7$': key.name = 'home'; key.shift = true; break
			case '[8$': key.name = 'end'; key.shift = true; break

			case 'Oa': key.name = 'up'; key.ctrl = true; break
			case 'Ob': key.name = 'down'; key.ctrl = true; break
			case 'Oc': key.name = 'right'; key.ctrl = true; break
			case 'Od': key.name = 'left'; key.ctrl = true; break
			case 'Oe': key.name = 'clear'; key.ctrl = true; break

			case '[2^': key.name = 'insert'; key.ctrl = true; break
			case '[3^': key.name = 'delete'; key.ctrl = true; break
			case '[5^': key.name = 'pageup'; key.ctrl = true; break
			case '[6^': key.name = 'pagedown'; key.ctrl = true; break
			case '[7^': key.name = 'home'; key.ctrl = true; break
			case '[8^': key.name = 'end'; key.ctrl = true; break

			/* misc. */
			case '[Z': key.name = 'tab'; key.shift = true; break
			default: key.name = 'undefined'; break
		}
	} else if (s.length > 1 && s[0] !== '\x1b') {
		// Got a longer-than-one string of characters.
		// Probably a paste, since it wasn't a control sequence.
		return Array.prototype.map.call(s, (c) => parse(c, enc))
	}

	if (s.length === 1) ch = s
	key.raw = s
	return key
}

// Regexes used for ansi escape code splitting
const metaKeyCodeRe = /^(?:\x1b)([a-zA-Z0-9])$/
const functionKeyCodeRe =
	/^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/



module.exports = Object.assign(keypress, {parse})
