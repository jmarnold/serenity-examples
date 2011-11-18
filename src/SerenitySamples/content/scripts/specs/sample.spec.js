describe('TimeCellModelTester', function () {
    it('should validate times', function () {
        var model = new TimeCellModel();
        expect(model.validateTime('77:77')).toEqual(false);
        expect(model.validateTime('12:77')).toEqual(false);
        expect(model.validateTime('12:30')).toEqual(true);
        expect(model.validateTime('12:3')).toEqual(true);
        expect(model.validateTime('12')).toEqual(true);
        expect(model.validateTime('7')).toEqual(false);
        expect(model.validateTime('07')).toEqual(true);
        expect(model.validateTime('07:3')).toEqual(true);
    });
	
	it('should reset time', function() {
		var model = new TimeCellModel({originalVal: '12:30'});
		model.set({timeValue: '14:45'});
		model.resetTime();
		
		expect(model.get('timeValue')).toEqual('12:30');
	});
	
	it('should add minutes', function() {
		var model = new TimeCellModel({timeValue: '12:30'});
		model.addMinute();
		
		expect(model.get('timeValue')).toEqual('12:31');
	});
	
	it('should subtract minutes', function() {
		var model = new TimeCellModel({timeValue: '12:30'});
		model.subtractMinute();
		
		expect(model.get('timeValue')).toEqual('12:29');
	});
});

describe('TimeEntryViewTester', function () {
    var view, model;
    var bind, unbind;
    var shouldTrigger;

    beforeEach(function () {
        model = new TimeCellModel();
        view = new TimeEntryView({ model: model });

        bind = Backbone.ModelBinding.bind;
        unbind = Backbone.ModelBinding.unbind;

        shouldTrigger = function (target, selector) {
            var invoked = false;
            view.bind(target, function () { invoked = true; });
            view.$(selector).click();
            expect(invoked).toEqual(true);
        };
    });

    afterEach(function () {
        Backbone.ModelBinding.unbind = unbind;
        Backbone.ModelBinding.bind = bind;
    });

    it('should trigger number event when number button is pressed', function () {
        shouldTrigger('number', '.number:first');
    });

    it('should trigger the clear event when the clear button is pressed', function () {
        shouldTrigger('clear', '.clear-btn');
    });

    it('should trigger the reset event when the reset button is pressed', function () {
        shouldTrigger('reset', '.reset-btn');
    });

    it('should trigger the right event when the right button is pressed', function () {
        shouldTrigger('right', '.right');
    });

    it('should trigger the left event when the left button is pressed', function () {
        shouldTrigger('left', '.left');
    });

    it('should trigger the clock event when the clock button is pressed', function () {
        shouldTrigger('clock', '.clock');
    });

    it('should bind to model', function () {
        // we need to make sure it unbinds the old model before binding to the new
        var someNewModel = new TimeCellModel({ timeValue: '12:12' });
        Backbone.ModelBinding.bind = jasmine.createSpy('Backbone.ModelBinding.bind');
        Backbone.ModelBinding.unbind = jasmine.createSpy('Backbone.ModelBinding.unbind');
        view.bindTo(someNewModel);

        expect(Backbone.ModelBinding.unbind).toHaveBeenCalledWith(view);
        expect(view.model).toEqual(someNewModel);
        expect(Backbone.ModelBinding.bind).toHaveBeenCalledWith(view);
    });

    it('should unbind from model during dispose', function () {
        Backbone.ModelBinding.unbind = jasmine.createSpy('Backbone.ModelBinding.unbind');
        view.dispose();
        expect(Backbone.ModelBinding.unbind).toHaveBeenCalledWith(view);
    });
});

describe('TimeEntryPresenterTester', function () {
	var presenter;
	var view;
	var model;
	var pressNumber;
	
	beforeEach(function() {
	    model = new TimeCellModel({
			originalVal: '12:30'
		});
		view = new TimeEntryView({model: model});
		presenter = new TimeEntryPresenter(view, model);
		
		pressNumber = function(x) {
			$(view.el).find('a.number').each(function() {
				if($(this).data('number') == x) {
					$(this).click();
				}
			});
		};
	});

	it('should_bind_model_on_initialize', function() {
		view.bindTo = jasmine.createSpy('TimeEntryView.bindTo');
		presenter.initialize();
		
		expect(view.bindTo).toHaveBeenCalled();
	});
	
	it('should_set_time_when_numerical_buttons_are_clicked', function() {
		presenter.initialize();
		
		view.trigger('number', 1);
		view.trigger('number', 2);
		view.trigger('number', 4);
		view.trigger('number', 0);
		
		expect(presenter.model.get('timeValue')).toEqual('12:40');
	});
	
	it('should_clear_time_when_button_is_pressed', function() {
		presenter.initialize();
		view.trigger('number', 1);
		view.trigger('number', 2);
		view.trigger('clear');
		
		expect(model.get('timeValue')).toEqual('');
	});
	
	it('should_reset_time_to_original_value', function() {
		presenter.initialize();
		view.trigger('number', 1);
		view.trigger('number', 2);
		view.trigger('reset');
		
		expect(model.get('timeValue')).toEqual('12:30');
	});
	
	it('should_set_time_to_current_time', function() {
		presenter.initialize();
		spyOn(TimeService, 'currentTime').andCallFake(function() {
			var date = new Date();
			date.setHours(15);
			date.setMinutes(0);
			return date;
		});
		view.trigger('clock');
		
		expect(model.get('timeValue')).toEqual('15:00');
	});
	
	it('should_increase_time', function() {
		presenter.initialize();
		spyOn(TimeService, 'currentTime').andCallFake(function() {
			var date = new Date();
			date.setHours(15);
			date.setMinutes(0);
			return date;
		});

		view.trigger('right');
		
		expect(model.get('timeValue')).toEqual('15:01');
	});
	
	it('should_decrease_time', function() {
		presenter.initialize();
		spyOn(TimeService, 'currentTime').andCallFake(function() {
			var date = new Date();
			date.setHours(15);
			date.setMinutes(0);
			return date;
		});

		view.trigger('left');
		expect(model.get('timeValue')).toEqual('14:59');
	});
	
	it('should_render_updates_from_clicking_number_buttons', function() {
		presenter.initialize();
		pressNumber('1');
		pressNumber('2');
		pressNumber('3');
		pressNumber('0');
		var time = '12:30';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_render_updates_from_clicking_clear_button', function() {
		presenter.initialize();
		pressNumber('1');
		pressNumber('2');
		pressNumber('3');
		pressNumber('0');
		$(view.el).find('a.clear-btn').click();
		var time = '';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_render_updates_from_clicking_reset_button', function() {
		presenter.initialize();
		pressNumber('1');
		pressNumber('2');
		pressNumber('4');
		pressNumber('5');
		$(view.el).find('a.reset-btn').click();
		var time = '12:30';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_render_updates_from_clicking_clock_button', function() {
		presenter.initialize();
		spyOn(TimeService, 'currentTime').andCallFake(function() {
			var date = new Date();
			date.setHours(15);
			date.setMinutes(0);
			return date;
		});
		$(view.el).find('a.clock').click();
		var time = '15:00';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_render_updates_from_clicking_right_button', function() {
		presenter.initialize();
		spyOn(TimeService, 'currentTime').andCallFake(function() {
			var date = new Date();
			date.setHours(15);
			date.setMinutes(0);
			return date;
		});
		$(view.el).find('a.clock').click();
		$(view.el).find('a.right').click();
		var time = '15:01';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_render_updates_from_clicking_left_button', function() {
		presenter.initialize();
		spyOn(TimeService, 'currentTime').andCallFake(function() {
			var date = new Date();
			date.setHours(15);
			date.setMinutes(0);
			return date;
		});
		$(view.el).find('a.clock').click();
		$(view.el).find('a.left').click();
		var time = '14:59';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_not_allow_invalid_times', function() {
		presenter.initialize();
		pressNumber('0');
		pressNumber('7');
		pressNumber('7');
		pressNumber('7');
		pressNumber('3');
		pressNumber('0');
		var time = '07:30';
		expect(model.get('timeValue')).toEqual(time);
		expect($('#time-display > span:first').html()).toEqual(time);
	});
	
	it('should_render_updates_when_selected_timecell_changes', function() {
		presenter.initialize();
		pressNumber('1');
		pressNumber('1');
		pressNumber('3');
		pressNumber('0');
		
		var time = '14:45';
		presenter.timeCellChanged(new TimeCellModel({
			timeValue: time
		}));
		
		expect($('#time-display > span:first').html()).toEqual(time);
	});
});