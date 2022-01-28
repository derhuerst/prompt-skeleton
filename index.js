'use strict'

const differ = require('ansi-diff-stream')
const esc = require('ansi-escapes')
const onKeypress = require('@derhuerst/cli-on-key')
const termSize = require('window-size').get

const action = (key) => {
	let code = key.raw.charCodeAt(0)

	if (key.ctrl) {
		if (key.name === 'a')     return 'first'
		if (key.name === 'c')     return 'abort'
		if (key.name === 'd')     return 'abort'
		if (key.name === 'e')     return 'last'
		if (key.name === 'g')     return 'reset'
	}
	if (key.name === 'return')    return 'submit'
	if (key.name === 'enter')     return 'submit' // ctrl + J
	if (key.name === 'backspace') return 'delete'
	if (key.name === 'abort')     return 'abort'
	if (key.name === 'escape')    return 'abort'
	if (key.name === 'tab')       return 'next'

	if (key.name === 'up')        return 'up'
	if (key.name === 'down')      return 'down'
	if (key.name === 'right')     return 'right'
	if (key.name === 'left')      return 'left'
	if (code === 8747)            return 'left'  // alt + B
	if (code === 402)             return 'right' // alt + F

	return false
}

const onResize = (stream, cb) => {
	stream.on('resize', cb)
	const stopListening = () => {
		stream.removeListener('resize', cb)
	}
	return stopListening
}

const wrap = (p) => {
	p.out = differ()
	p.out.pipe(process.stdout)

	p.bell = () => {
		process.stdout.write(esc.beep)
	}
	if ('function' !== typeof p._) p._ = p.bell

	const onKey = (key) => {
		let a = action(key)
		if (a === 'abort') return p.close()
		if (a === false) p._(key.raw)
		else if ('function' === typeof p[a]) p[a](key)
		else process.stdout.write(esc.beep)
	}

	const onNewSize = () => {
		const {width, height} = termSize()
		p.out.reset()
		p.render(true)
	}

	let offKeypress, offResize
	const pause = () => {
		if (!offKeypress) return
		offKeypress()
		offKeypress = null
		offResize()
		offResize = null
		process.stdout.write(esc.cursorShow)
	}
	p.pause = pause
	const resume = () => {
		if (offKeypress) return
		offKeypress = onKeypress(process.stdin, onKey)
		offResize = onResize(process.stdout, onNewSize)
		process.stdout.write(esc.cursorHide)
	}
	p.resume = resume

	return new Promise((resolve, reject) => {
		let isClosed = false
		p.close = () => {
			if (isClosed) return null
			isClosed = true

			p.out.unpipe(process.stdout)
			pause()

			if (p.aborted) reject(p.value)
			else resolve(p.value)
		}
		process.on('beforeExit', () => p.close())

		if ('function' !== typeof p.submit) p.submit = p.close
		resume()
		p.render(true)
	})
}

module.exports = Object.assign(wrap, {action})
