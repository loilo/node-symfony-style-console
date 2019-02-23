

const wrapper = require('./wrapper')

test('11 Ensure long words are properly wrapped in blocks', wrapper(io => {
	io.block(
		'Lopadotemachoselachogaleokranioleipsanodrimhypotrimmatosilphioparaomelitokatakechymenokichlepikossyphophattoperisteralektryonoptekephalliokigklopeleiolagoiosiraiobaphetraganopterygon',
		'CUSTOM',
		'fg=white;bg=blue',
		' § ',
		false
	)
}))
