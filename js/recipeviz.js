var RecipeViz = function() {
	var
	handleSubmit = function() {
		parseAndDraw($('#ckbk').val());
		jump('diagram');
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
			else {
				// TODO
				types.push(trigger.type);
			}
		});
		return types.join(', ');
	},
	processConditions = function(conditions, elements, paths) {
		$.each(conditions, function(index, condition) {
			var str = "r" + index + "=>condition: ";
			if(condition.type === 'ContactFieldEqualsRule') {
				// TODO add multi-recipient support
				str += ("is contact field\n'" + condition.data.fieldName + "'\nequal to\n'" + condition.data.valueToCompare +"'?");
			}
			else if(condition.type=='ContactKnownRule') {
				str += "is the contact known?"
			}
			else if(condition.type === 'ContactMemberOfGroupRule') {
				str += "is the contact a\nmember of the group '" + condition.data.groupName + "'?";
			}
			else if(condition.type === 'CustomFieldBooleanRule') {
				str += "is the true/false contact field\n'" + condition.data.customFieldName + "' " + condition.data.valueToCompare +"?";
			}
			else if(condition.type === 'CustomFieldIntegerRule') {
				str += "is the numeric contact field\n'" + condition.data.customFieldName + "' " + condition.data.operator.toLowerCase().replace('_', ' ') + " " + condition.data.stringToCompare + "?";
			}
			else if(condition.type === 'MessageTextContainsRule') {
				str += "Does the SMS text contain '" + condition.data.messageContainsText + "'?";
			}
			else if(condition.type === 'MessageTextReceivedWithinPeriodRule') {
				//TODO
				str += condition.type;
			}
			else if(condition.type === 'MessageTextSentWithinPeriodRule') {
				// TODO
				str += condition.type;
			}
			else if(condition.type === 'MessageTextStartsWithRule') {
				str += "Does the SMS text contain '" + condition.data.messageContainsText + "'?";
			}
			else if(condition.type === 'MissedCallReceivedWithinPeriodRule') {
				// TODO
				str += condition.type;
			}
			else if(condition.type === 'NumberContainsRule') {
				// TODO
				str += condition.type;
			}
			else if(condition.type === 'NumberStartsWithRule') {
				// TODO
				str += condition.type;
			}
			else if(condition.type === 'ReceivedOnConnectionRule') {
				// TODO
				str += condition.type;
			}
			str += "|Yes|No";
			elements.push(str);
			if(index === 0) {
				paths.push("st->r0");
			}
			else {
				paths.push("r" + (index - 1) + "(yes)->r" + index);
			}
		});
	},
	processActions = function(actions, elements, paths, isElseAction, conditionCount) {
		$.each(actions, function(index, action) {
			var actionPrefix = isElseAction ? 'ea' : 'a',
			str = actionPrefix + index + "=>operation: " + action.type;
			if(action.type == 'TriggerRecipeAction') {
				str += ":>#" + action.data.recipeToTriggerId;
			}
			//TODO
			elements.push(str);
			if(index === 0) {
				if(!isElseAction) {
					if(conditionCount > 0) {
						paths.push("r" + (conditionCount - 1) + "(yes)->" + actionPrefix + "0");
					}
					else {
						paths.push("st->a0");
					}
				}
				else {
					if(conditionCount > 0) {
					}
				}
			}
			else {
				paths.push(actionPrefix + (index - 1) + "->" + actionPrefix + index);
			}
		});
	},
	parseAndDraw = function(cookbookJson) {
		var cookbook = JSON.parse(cookbookJson).collections[0];
		$.each(cookbook.recipes, function(index, recipe) {
			var elements = [], paths = [];
			elements.push("st=>start: " + getTriggerTypes(recipe));
			processConditions(recipe.conditions, elements, paths);
			processActions(recipe.actions, elements, paths, false, recipe.conditions.length);
			processActions(recipe.elseActions, elements, paths, true, recipe.conditions.length);
			elements.push('e=>end: End|end')

			if(recipe.actions.length > 0)  {
				if(recipe.conditions.length > 0) {
					// link last condition to first action is done in processActions
				}
				else {
					// link start frist action is done in processActions
				}
				paths.push('a' + (recipe.actions.length - 1) + '->e');
			}
			else {
				if(recipe.conditions.length > 0) {
					// link last condition to end?
					paths.push('r' + (recipe.conditions.length - 1) + '(yes)->e');
				}
				else {
					// link start to end?
					paths.push('st->e');
				}
			}

			if(recipe.elseActions.length >0 ) {
				// link every condition's (no) path to first else action
				// link last else action to end
				for(var i = 0; i < recipe.conditions.length; i++) {
					paths.push('r' + i + '(no)->ea0');
				}
				paths.push('ea' + (recipe.elseActions.length - 1) + '->e');
			}
			else {
				// link every condition's (no) path to end?
				for(var i = 0; i < recipe.conditions.length; i++) {
					paths.push('r' + i + '(no)->e');
				}
			}
			console.log(elements.concat(paths).join('\n'));
			$('#diagram').append('<div class="recipeDiagram panel panel-' + (index % 1 === 0 ? 'success' : 'default') +'"><div class="panel-heading">' + recipe.name + '</div><div class="panel-body" id="' + recipe.id +'"></div>');
			draw(recipe.id, elements.concat(paths).join('\n'));
		});
	},
	draw = function(recipeId, diagramDescriptor) {
		var diagram = flowchart.parse(diagramDescriptor);
		diagram.drawSVG(recipeId, {
			'x': 0,
			'y': 0,
			'line-width': 2,
			'line-length': 50,
			'text-margin': 15,
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
	jump = function(h){
		var url = location.href;
		location.href = "#"+h;
		history.replaceState(null,null,url);
	}
	init = function() {
		$('#go').click(handleSubmit);
	};
	init();
},
recipeViz;
$(function() {
	recipeViz = new RecipeViz();
});
