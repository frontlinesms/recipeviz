var RecipeViz = function() {
	var
	handleSubmit = function() {
		parseAndDraw($('#ckbk').val());
	},
	getTriggerTypes = function(recipe) {
		var types = [];
		$.each(recipe.triggers, function(i, trigger) {
			if(trigger.type == "TEXT_MESSAGE") {
				types.push('SMS');
			}
			else if(trigger.type == "MISSED_CALL") {
				types.push('Missed Call');
			}
			else if(trigger.type == "TIME") {
				if(typeof trigger.data.nextTriggerTime !== 'undefined') {
					types.push(new Date(trigger.data.nextTriggerTime).toString("on dd/m/yy hh:mm"));
				}
				else {
					var str = "Every ";
					if(trigger.data.repeatFrequency > 1) {
						str += trigger.data.repeatFrequency;
						if(trigger.data.scheduleType === 'DAILY') {
							str += " days ";
						}
						else {
							str += " weeks ";
						}
					}
					else {
						if(trigger.data.scheduleType === 'DAILY') {
							str += "day ";
						}
						else {
							str += "week ";
						}
					}
					if(trigger.data.scheduleType === 'WEEKLY') {
						str += "on " + trigger.data.dayOfWeek + " ";
					}
					str += "at " + trigger.data.hourOfDay + ":" + trigger.data.minuteOfHour;
					types.push(str);
				}
			}
		});
		return types.join(', ');
	}
	parseAndDraw = function(cookbookJson) {
		var cookbook = JSON.parse(cookbookJson);
		$.each(cookbook.recipes, function(index, recipe) {
			var elements = [
			],
			paths = [
			];
			elements.push("st=>start: " + recipe.name + "\n" + getTriggerTypes(recipe));
			console.log(elements.concat(paths).join('\n'));
			//draw(elements.concat(paths).join('\n'));
		});
		/*
		[
			"st=>start: Start|past:>http://www.google.com[blank]",
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
			"c2(no)->op2->e"
		].join('\n');
		*/
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
			'font-family': 'arial',
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
				'trigger' : {'fill' : '#abd', 'font-color' : '#333', 'font-weight' : 'bold'},
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
