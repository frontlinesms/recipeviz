var RecipeViz = function() {
	var
	handleSubmit = function() {
		draw(parseDiagram($('#ckbk').text()));
	},
	parseDiagram = function(cookbookJson) {
		return ["st=>start: Start|past:>http://www.google.com[blank]",
			"e=>end: Ende|future:>http://www.google.com",
			"op1=>operation: My Operation|past",
			"op2=>operation: Stuff|current",
			"sub1=>subroutine: My Subroutine|invalid",
			"cond=>condition: Yes ",
			"or No?|approved:>http://www.google.com",
			"c2=>condition: Good idea|rejected",
			"io=>inputoutput: catch something...|future",
			"st->op1(right)->cond",
			"cond(yes, right)->c2",
			"cond(no)->sub1(left)->op1",
			"c2(yes)->io->e",
			"c2(no)->op2->e"].join('\n');
	},
	draw = function(diagramDescriptor) {
		var diagram = flowchart.parse(diagramDescriptor);
		console.log('here');
		diagram.drawSVG('diagram', {
			'x': 0,
			'y': 0,
			'line-width': 3,
			'line-length': 50,
			'text-margin': 10,
			'font-size': 14,
			'font-color': 'black',
			'line-color': 'black',
			'element-color': 'black',
			'fill': 'white',
			'yes-text': 'yes',
			'no-text': 'no',
			'arrow-end': 'block',
			// style symbol types
			'symbols': {
				'start': {
					'font-color': 'red',
			'element-color': 'green',
			'fill': 'yellow'
				},
				'end':{
					'class': 'end-element'
				}
			},
			// even flowstate support ;-)
			'flowstate' : {
				'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
				'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
				'future' : { 'fill' : '#FFFF99'},
				'request' : { 'fill' : 'blue'},
				'invalid': {'fill' : '#444444'},
				'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
				'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
			}
		});
	},
	init = function() {
		$('#go').click(handleSubmit);
	};
	init();
},
recipeViz;
$(function() {
	recipeViz = new RecipeViz();
});
