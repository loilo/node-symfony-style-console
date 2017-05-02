

const wrapper = require('../wrap-test')

test('11 Ensure long words are properly wrapped in blocks', wrapper(11, io => {
	io.block(
		'Lopadotemachoselachogaleokranioleipsanodrimhypotrimmatosilphioparaomelitokatakechymenokichlepikossyphophattoperisteralektryonoptekephalliokigklopeleiolagoiosiraiobaphetraganopterygon',
		'CUSTOM',
		'fg=white;bg=blue',
		' § ',
		false
	)
}))
