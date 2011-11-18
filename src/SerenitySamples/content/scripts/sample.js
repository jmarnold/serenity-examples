TimeCellModel = Backbone.Model.extend({
    defaults: {
        timeValue: '',
        originalVal: ''
    },
    appendTime: function (val) {
        var timeValue = this.get('timeValue');
        if (timeValue.length == 2) {
            timeValue += ':';
        }

        timeValue += val;
        if (!this.validateTime(timeValue)) {
            return;
        }

        this.set({ timeValue: timeValue });
    },
    validateTime: function (time) {
        var n = time.indexOf(':') == -1 ? 4 : 5;
        if (time.length < n) {
            var x = n - time.length;
            for (var i = 0; i < x; i++) {
                if (time.length == 2) {
                    time += ':';
                }
                time += '0';
            }
        }

        var isValid = Date.parse(time) != null;
        return isValid;
    },
    resetTime: function () {
        var val = this.get('originalVal');
        this.set({ timeValue: val });
    },
    addMinute: function () {
        var date = Date.parse(this.get('timeValue'));
        date.add({ minutes: 1 });
        this.set({ timeValue: date.toString('HH:mm') });
    },
    subtractMinute: function () {
        var date = Date.parse(this.get('timeValue'));
        date.add({ minutes: -1 });
        this.set({ timeValue: date.toString('HH:mm') });
    }
});

TimeEntryPresenter = function(view, model) {
	this._view = view;
	this.model = model;
	
	this.initialize = function() {
		this.timeCellChanged(this.model);
		var self = this;
		this._view.bind('number', function(val) {
			self.model.appendTime(val);
		});
		this._view.bind('clear', function() {
			self.model.set({timeValue: ''});
		});
		this._view.bind('reset', function() {
			self.model.resetTime();
		});
		this._view.bind('clock', function() {
			// TODO -- js datetime fun
			var date = TimeService.currentTime();
			self.model.set({timeValue: date.toString('HH:mm')});
		});
		this._view.bind('right', function() {
			var time = self.model.get('timeValue');
			if(time == '') {
				self._view.trigger('clock');
			}
			
			self.model.addMinute();
		});
		this._view.bind('left', function() {
			var time = self.model.get('timeValue');
			if(time == '') {
				self._view.trigger('clock');
			}
			
			self.model.subtractMinute();
		});
	};
	
	this.timeCellChanged = function(timeCell) {
		this.model = timeCell;
		this._view.bindTo(this.model);
	};
};

TimeEntryView = Backbone.View.extend({
	el: '#timestamp-tool',
	initialize: function() {
		var self = this;;
		$(this.el).find('.number').click(function() {
			var val = $(this).data('number');
			self.trigger('number', val);
		});
		$(this.el).find('.clear-btn').click(function() {
			self.trigger('clear');
		});
		$(this.el).find('.reset-btn').click(function() {
			self.trigger('reset');
		});
		$(this.el).find('.clock').click(function() {
			self.trigger('clock');
		});
		$(this.el).find('.right').click(function() {
			self.trigger('right');
		});
		$(this.el).find('.left').click(function() {
			self.trigger('left');
		});
	},
	bindTo: function(timeCell) {
		Backbone.ModelBinding.unbind(this);
		this.model = timeCell;
		Backbone.ModelBinding.bind(this);
	},
    dispose: function () {
        Backbone.ModelBinding.unbind(this);
    }
});

TimeService = (function () {
    var service = {
        currentTime: function () {
            // TODO -- js datetime fun
            return new Date();
        }
    };
    return service;
} ());