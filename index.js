'use strict'

const passStream = require('pass-stream')
const esc        = require('ansi-escapes')

const onKeypress = require('./on-keypress')



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



const wrap = (p) => {
	p.out = passStream()
	p.out.pipe(process.stdout)

	p.bell = () => {p.out.write(esc.beep)}

	const values = passStream(null, null, {objectMode: true})
	p.emit = () => {values.write({
		  value:   p.value
		, aborted: !!p.aborted
	})}

	const offKeypress = onKeypress(process.stdin, (key) => {
		let a = action(key)
		if (a === false) p._(key.raw)
		else if (a in p) p[a]()
		else p.out.write(esc.beep)
	})

	let isClosed = false
	p.close = () => {
		if (isClosed) return; isClosed = true
		p.out.write(esc.cursorShow)
		p.out.unpipe()
		offKeypress()
		values.end()
		values.emit(p.aborted ? 'abort' : 'submit', p.value)
	}

	p.render(true)
	return values
}



module.exports = Object.assign(wrap, {action})
