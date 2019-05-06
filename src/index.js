import Application from './Application'
import Scene from './Scene'

import * as Pixi from 'pixi.js'

const app = new Application({
	view: document.querySelector('canvas'),
	width: window.innerWidth,
	height: window.innerHeight
})

class Point extends Pixi.Graphics {
	constructor (x = 0, y = 0) {
		super()

		this.x = x
		this.y = y
		this.r = 2
		this.active = false
		
		this.xVelocity = 0
		this.yVelocity = 0
		this.color = [0xffffff, 0xffff00, 0xff00ff, 0x00ffff, 0x0000ff, 0x00ff00, 0xff0000][getIntRandomBetween(0, 6)]
	}

	tick (delta) {
		if (this.active) {
			this.r += 1

			if (this.r >= Point.R) {
				const points = level.points
				points.splice(points.indexOf(this), 1)
				app._container.removeChild(this)
			}
		}

		else {
			const x = this.x + this.xVelocity
			const y = this.y + this.yVelocity

			if (!(0 < x && x < app._renderer.width)) {
				this.xVelocity *= -1
			}

			if (!(0 < y && y < app._renderer.height)) {
				this.yVelocity *= -1
			}


			this.position.set(this.x + this.xVelocity, this.y + this.yVelocity)
		}
	}

	draw () {
		this.clear()

		if (!this.active) {
			this.beginFill(this.color)
			this.drawCircle(0, 0, this.r)
			this.endFill()
		} else {
			this.lineStyle(1, this.color)			
			this.drawCircle(0, 0, this.r)
		}
	}
}

Point.SPEED = 10
Point.R = 100

class Level {
	constructor () {
		this.current = 1
		this.points = []
		this.actived = false

		this.fill()
	}

	click (position) {
		if (this.actived) {
			return
		}

		this.actived = true

		const point = new Point()
		point.x = position.x
		point.y = position.y
		point.active = true
		this.points.push(point)
	}

	fill () {
		for (let i = 0; i < this.current; i++) {
			const point = new Point()
			const angle = getRandomBetween(0, Math.PI * 2)

			point.x = getRandomBetween(10, app._renderer.width - 20)
			point.y = getRandomBetween(10, app._renderer.height - 20)

			point.xVelocity = Point.SPEED * Math.cos(angle)
			point.yVelocity = Point.SPEED * Math.sin(angle)

			this.points.push(point)
		}
	}

	up () {
		if (!this.points.length) {
			this.current += 1
		}

		this.actived = false

		for (const point of this.points) {
			app._container.removeChild(point)
		}

		this.points = []
		this.fill()

		for (const point of this.points) {
			app._container.addChild(point)
		}
	}
}

const level = new Level

class MainScene extends Scene {
	constructor (...args) {
		super(...args)

		this.level = level
	}

	load (loader) {}

	create (container, loader, renderer) {
		for (const point of this.level.points) {
			container.addChild(point)
		}

		container.hitArea = new Pixi.Rectangle(0, 0, renderer.width, renderer.height)

		container.interactive = true
		container.buttonMode = true

		container.on('click', () => {
			this.level.click(renderer.plugins.interaction.mouse.global)
			container.addChild(this.level.points[this.level.points.length - 1])
		})
	}

	update (delta, duration) {
		const pointsActived = this.level.points.filter(p => p.active)

		for (const point of this.level.points) {
			if (point.active) {
				continue
			}

			point.active = pointsActived.some(p => getDist(p, point) < p.r)
		}

		for (const point of this.level.points) {
			point.tick(delta)
		}

		for (const point of this.level.points) {
			point.draw()
		}

		if (this.level.actived && !pointsActived.length) {
			this.level.up()
		}
	}
}

app.addScene('MainScene', new MainScene)

function getRandomBetween (min, max) {
	return min + Math.random() * (max - min + 1)
}

function getIntRandomBetween (min, max) {
	return min + Math.floor(Math.random() * (max - min + 1))
}

function getDist (a, b) {
	return ((a.x - b.x)**2 + (a.y - b.y)**2)**0.5
}