'use strict'

const wrap = require('.')

const prompt = wrap({
	value: 0,
	up: function () {
		this.value++
		this.render()
	},
	down: function () {
		this.value--
		this.render()
	},
	render: function () {
		this.out.write(`The value is ${this.value}.`)
	}
})

prompt
.then(console.log)
.catch(console.error)
