var colorSchemes = [
	['#222222', '#878787', '#E62291', '#7878C8', '#2828DC', '#91c297', '#c18881', '#4f545c'],
	['#063498', '#078212', '#bff252', '#090d73', '#0a9499', '#333333', '#039954', '#032847'],
	['#c2b749', '#b7917e', '#ecedb8', '#7980b4', '#be8338', '#e98e22', '#95d19c', '#dca26b'],
	['#857b5e', '#623db0', '#431d80', '#61a62d', '#2f1941', '#2db4bd', '#7b631b', '#2c7835'],
	['#b0ca20', '#908136', '#602A44', '#9e9340', '#894439', '#a1a036', '#7ab437', '#bf6546'],
	['#c45713', '#d38021', '#dbac48', '#b2560a', '#db7827', '#ff8800', '#e5b722', '#ea4520'],
	['#853286', '#569d4f', '#6fb280', '#698166', '#611670', '#4d488a', '#85594d', '#7e1d49'],
	['#bbbb88', '#4444bb', '#777722', '#6666aa', '#883366', '#777733', '#cccc77', '#9999cc'],
	['#470b79', '#870e4c', '#6e3afe', '#5d3959', '#79302b', '#b50f81', '#a934aa', '#262534'],
	['#958a31', '#85be4a', '#784b8f', '#769d70', '#bf5952', '#91c297', '#c18881', '#4f545c'],
	['#2ee847', '#25c43a', '#0e2611', '#1da32f', '#167a23', '#164c1d', '#3a7241', '#526d55'],
	['#666666', '#888888', '#aaaaaa', '#777777', '#999999', '#cccccc', '#cacaca', '#bbbbbb'],
	['#33ca9d', '#797495', '#7f6362', '#0adc5e', '#399cc8', '#087b76', '#3f7258', '#aeafae'],
	['#aaaaaa', '#888888', '#333333', '#777777', '#999999', '#666666', '#252525', '#444444'],
	['#cc7939', '#8ec264', '#61bd0a', '#6a7b4a', '#6e8812', '#50c044', '#c2af0e', '#ad9760'],
];

/* Rule Sets:
Neighbor configurations:
	o: all 8 adjacent
	+: only horizontal and vertical (t shape)
	x: only diagonals
///to add someday:
	>: top left, bottom left, and right
	<: top right, bottom right, and left
	^: top, bottom left and bottom right
	v: bottom, top right, top left

Cell Generation Types:
	vivacity - number of neighbors alive
	diversity - number of types of live neighbors
	affinity - number of a specific type (must specify)

note: 'dead' state is always 0.

*/

var ruleSets = [{ //A
		neighborTypes: [
			['o', 'a', [0, 1, 2, 3, 4]],
			['+', 'v'],
			['+', 'a', [0, 1, 2, 3, 4]],
			['+', 'v'],
			['o', 'a', [0, 1, 2]],
			['+', 'a', [0, 1, 2]],
			['x', 'v'],
			['x', 'd']
		],
		transitions: [
			[1, 4, 0, 1, 0, 0, 1, 0, 0],
			[7, 3, 0, 0, 1],
			[5, 0, 0, 6, 6],
			[3, 2, 0, 0, 2],
			[0, 0, 0, 0, 0, 2, 5, 5, 1],
			[0, 0, 6, 0, 0],
			[4, 0, 0, 0, 0],
			[0, 1, 5, 0, 0]
		],
		seedPercent: 6
	}, { //B
		neighborTypes: [
			['x', 'v'],
			['x', 'v'],
			['x', 'v']
		],

		transitions: [
			[0, 0, 0, 2, 1],
			[0, 0, 2, 1, 0],
			[0, 0, 1, 2, 0]
		],
		seedPercent: 50
	}, { //C
		neighborTypes: [
			['o', 'a', [0]],
			['o', 'a', [0]],
			['o', 'a', [0]]
		],

		transitions: [
			[0, 0, 0, 1, 2, 1, 2, 2, 2],
			[0, 1, 1, 1, 2, 2, 0, 0, 1],
			[0, 2, 2, 1, 1, 1, 0, 0, 2]
		],
		seedPercent: 1
	}, { //D
		neighborTypes: [
			['+', 'd'],
			['x', 'v'],
			['+', 'a', [0, 1, 2]],
			['+', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 4, 0, 0, 4],
			[4, 1, 0, 2, 3],
			[0, 3, 1, 2, 1],
			[0, 2, 1, 2, 2],
			[0, 0, 0, 0, 2]
		],
		seedPercent: 0.3
	}, { //E
		neighborTypes: [
			['o', 'v'],
			['x', 'd'],
			['+', 'a', [0, 1]]
		],

		transitions: [
			[0, 0, 0, 2, 1, 1, 0, 0, 1],
			[0, 1, 0, 0, 2],
			[0, 0, 1, 2, 0]
		],
		seedPercent: 5
	}, { //F
		neighborTypes: [
			['x', 'd'],
			['o', 'a', [0]],
			['o', 'd'],
			['o', 'd'],
			['+', 'a', [0, 1, 2, 3]],
			['x', 'v']
		],
		transitions: [
			[0, 0, 5, 0, 0],
			[0, 4, 0, 4, 5, 0, 0, 1, 2],
			[2, 2, 1, 0, 4, 0, 5, 3, 0],
			[0, 3, 0, 4, 1, 1, 0, 5, 0],
			[0, 4, 5, 0, 0],
			[0, 0, 0, 2, 0]
		],
		seedPercent: 40
	}, { //G
		neighborTypes: [
			['x', 'd'],
			['o', 'a', [0, 1]],
			['+', 'v'],
			['+', 'v'],
			['+', 'd'],
			['o', 'a', [0]]
		],
		transitions: [
			[3, 0, 0, 0, 1],
			[0, 0, 5, 0, 0, 0, 0, 1, 4],
			[0, 1, 2, 4, 3],
			[0, 4, 4, 0, 0],
			[3, 0, 2, 3, 0],
			[0, 0, 0, 0, 0, 0, 1, 1, 0]
		],
		seedPercent: 0.5
	}, { //H
		neighborTypes: [
			['+', 'v'],
			['+', 'v'],
			['x', 'a', [0, 0, 1, 2, 3]],
			['x', 'v'],
			['x', 'a', [0]],
			['x', 'v'],
			['+', 'a', [0, 0, 1, 2, 3]],
			['+', 'v']
		],
		transitions: [
			[0, 0, 1, 5, 0],
			[2, 6, 0, 6, 6],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 3, 3],
			[0, 0, 0, 7, 7],
			[0, 0, 2, 0, 0],
			[0, 0, 0, 4, 0],
			[1, 0, 0, 0, 3]
		],
		seedPercent: 20
	}, { //I
		neighborTypes: [
			['o', 'd'],
			['x', 'd'],
			['+', 'd'],
			['x', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 0, 4, 3, 0],
			[0, 0, 4, 2, 3],
			[0, 0, 0, 0, 0],
			[2, 2, 0, 0, 0],
			[3, 0, 0, 3, 0]
		],
		seedPercent: 5
	}, { //J
		neighborTypes: [
			['+', 'd'],
			['x', 'v']
		],
		transitions: [
			[1, 0, 0, 1, 0],
			[0, 0, 0, 0, 1]
		],
		seedPercent: 0.02
	}, { //K
		neighborTypes: [
			['x', 'd'],
			['+', 'a', [0, 1, 2, 0, 3]],
			['x', 'a', [0, 1, 2, 0, 3, 4]],
			['x', 'd'],
			['x', 'v'],
			['+', 'v'],
			['o', 'v']
		],
		transitions: [
			[2, 0, 0, 0, 0],
			[4, 0, 1, 4, 0],
			[2, 0, 0, 3, 5],
			[1, 0, 0, 0, 0],
			[1, 3, 0, 2, 0],
			[0, 2, 0, 0, 0],
			[0, 0, 4, 3, 0, 0, 5, 1, 0]
		],
		seedPercent: 0.18
	}, { //L
		neighborTypes: [
			['o', 'd'],
			['x', 'd'],
			['+', 'd'],
			['x', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 0, 1, 0, 0],
			[2, 0, 0, 3, 0],
			[2, 0, 0, 3, 0],
			[3, 0, 0, 4, 0],
			[3, 0, 1, 2, 0]
		],
		seedPercent: 2
	}, { //M
		neighborTypes: [
			['o', 'd'],
			['x', 'v'],
			['+', 'a', [0]],
			['+', 'a', [0, 1]]
		],
		transitions: [
			[3, 0, 2, 0, 0, 0, 0, 3, 0],
			[0, 0, 0, 0, 3],
			[1, 1, 0, 0, 0],
			[2, 0, 0, 0, 1]
		],
		seedPercent: 0.1
	}, { //N
		neighborTypes: [
			['x', 'a', [0]],
			['x', 'v']
		],
		transitions: [
			[0, 0, 1, 0, 0],
			[1, 1, 1, 0, 0]
		],
		seedPercent: 10
	}, { //O
		neighborTypes: [
			['+', 'd'],
			['+', 'd'],
			['+', 'v'],
			['+', 'v'],
			['o', 'v']
		],
		transitions: [
			[2, 0, 0, 0, 1],
			[3, 1, 1, 1, 2],
			[2, 0, 2, 0, 0],
			[3, 1, 3, 1, 1],
			[3, 1, 1, 1, 2, 1, 0, 3, 0]
		],
		seedPercent: 0.2
	}, { //P
		neighborTypes: [
			['o', 'd'],
			['x', 'd'],
			['+', 'd'],
			['x', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 0, 1, 3, 1],
			[4, 0, 1, 0, 0],
			[0, 2, 3, 0, 0],
			[1, 1, 0, 0, 4],
			[0, 0, 2, 2, 1]
		],
		seedPercent: 3
	}, { //Q
		neighborTypes: [
			['o', 'd'],
			['x', 'd'],
			['+', 'd'],
			['x', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 3, 0, 2, 2],
			[0, 3, 2, 0, 0],
			[2, 0, 4, 2, 2],
			[0, 3, 0, 2, 0],
			[0, 3, 3, 2, 1]
		],
		seedPercent: 8
	}, { //R
		neighborTypes: [
			['x', 'd'],
			['+', 'd'],
			['o', 'a', [0, 1, 2]],
			['o', 'v'],
			['+', 'd'],
			['o', 'd'],
			['o', 'a', [0, 1, 2]]
		],
		transitions: [
			[0, 4, 5, 0, 5],
			[0, 0, 0, 0, 3],
			[6, 0, 4, 3, 0, 0, 3, 0, 5],
			[5, 0, 0, 0, 0, 6, 6, 2, 1],
			[0, 0, 0, 6, 4],
			[0, 0, 5, 4, 3, 0, 5, 4, 0],
			[0, 0, 5, 3, 0, 1, 5, 0, 1]
		],
		seedPercent: 1.6
	}, { //S
		neighborTypes: [
			['o', 'd'],
			['x', 'v'],
			['x', 'a', [4]],
			['x', 'd'],
			['o', 'd']
		],
		transitions: [
			[0, 0, 4, 3, 0, 0, 0, 0, 0],
			[1, 0, 2, 4, 1],
			[0, 4, 1, 0, 1],
			[0, 0, 2, 0, 0],
			[3, 0, 0, 4, 1, 0, 0, 4, 2]
		],
		seedPercent: 9
	}, { //T
		neighborTypes: [
			['o', 'd'],
			['x', 'd'],
			['+', 'd'],
			['x', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 3, 0, 2, 3],
			[3, 0, 3, 1, 0],
			[0, 0, 0, 3, 1],
			[0, 3, 4, 1, 1],
			[0, 0, 4, 1, 3]
		],
		seedPercent: 3
	}, { //U
		neighborTypes: [
			['o', 'v'],
			['o', 'd'],
			['x', 'a', [1, 2, 0]],
			['+', 'a', [0]],
			['x', 'a', [0, 1]]
		],
		transitions: [
			[0, 0, 0, 1, 3, 3, 0, 2, 4],
			[0, 0, 0, 1, 0, 0, 1, 2, 4],
			[2, 0, 1, 0, 0],
			[0, 0, 3, 3, 2],
			[0, 4, 0, 4, 3]
		],
		seedPercent: 4
	}, { //V
		neighborTypes: [
			['+', 'a', [2, 1, 0]],
			['o', 'a', [2, 1, 0]],
			['x', 'v'],
			['x', 'a', [0]],
			['x', 'a', [0]]
		],
		transitions: [
			[0, 4, 4, 0, 0],
			[0, 0, 0, 0, 1, 2, 0, 4, 3],
			[0, 0, 2, 0, 0],
			[0, 3, 0, 0, 4],
			[0, 0, 0, 0, 4]
		],
		seedPercent: 12
	}, { //W
		neighborTypes: [
			['+', 'a', [0, 1]],
			['+', 'v'],
			['x', 'a', [0]],
			['+', 'v'],
			['+', 'v']
		],
		transitions: [
			[0, 0, 3, 0, 0],
			[0, 4, 1, 3, 2],
			[0, 2, 2, 1, 3],
			[0, 0, 0, 1, 4],
			[0, 4, 0, 3, 2]
		],
		seedPercent: 5
	}, { //X
		neighborTypes: [
			['o', 'd'],
			['x', 'd'],
			['+', 'd'],
			['x', 'd'],
			['+', 'd']
		],
		transitions: [
			[0, 0, 3, 0, 0],
			[0, 0, 4, 2, 0],
			[0, 4, 0, 0, 0],
			[2, 0, 3, 0, 3],
			[3, 4, 0, 0, 2]
		],
		seedPercent: 5
	}, { //Y
		neighborTypes: [
			['x', 'v'],
			['o', 'a', [0, 1]],
			['+', 'd'],
			['+', 'd'],
			['o', 'a', [1, 2, 0]]
		],
		transitions: [
			[0, 0, 3, 2, 2],
			[0, 0, 2, 4, 4, 0, 0, 2, 0],
			[0, 0, 4, 2, 1],
			[0, 0, 0, 0, 0],
			[0, 0, 3, 0, 0, 0, 2, 1, 3]
		],
		seedPercent: 10.6
	}, { //Z
		neighborTypes: [
			['+', 'v'],
			['o', 'a', [0, 1]],
			['o', 'a', [0, 1]],
			['+', 'd'],
			['x', 'v']
		],
		transitions: [
			[0, 0, 3, 0, 4],
			[0, 0, 0, 0, 0, 3, 0, 3, 3],
			[0, 0, 0, 0, 3, 1, 0, 0, 0],
			[0, 2, 0, 0, 3],
			[0, 0, 0, 0, 0]
		],
		seedPercent: 15
	}

];