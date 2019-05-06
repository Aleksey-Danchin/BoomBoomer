import * as Pixi from 'pixi.js'

class Application {
	constructor (params) {
		this._loader = new Pixi.Loader
		this._renderer = new Pixi.Renderer(params)
		this._container = new Pixi.Container
		this._ticker = new Pixi.Ticker

		this._createMomemnt = Date.now()

		this._scenesMap = new Map
		this._scenesSet = new Set
	}

	addScene (name, scene) {
		if (this._scenesSet.has(scene)) {
			return this
		}

		this._scenesMap.set(name, scene)
		this._scenesSet.add(scene)

		scene.load(this._loader)

		this._loader.load(() => {
			scene.create(this._container, this._loader, this._renderer)

			this._ticker.add(() => {
				const nowMomemnt = Date.now()
				const delta = nowMomemnt - scene._lastTickMomemnt

				scene._lastTickMomemnt = Date.now()
				scene.update(delta, scene._lastTickMomemnt - this._createMomemnt)
			})

			this._ticker.start()
		})

		this._ticker.add(() => this._renderer.render(this._container))

		return this
	}
}

export default Application