'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var generateSchema = require('generate-schema');
var compiler = require('json-schema-to-typescript');

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-json2dts', 'Streaming not supported'));
			return;
		}

		try {
			var fileName = file.relative.split('.')[0];
			var jsonSchema = generateSchema.json(fileName, JSON.parse(file.contents.toString()));
			var tsInterface = compiler.compile(jsonSchema);
			file.path = gutil.replaceExtension(file.path, '.d.ts');
			file.contents = new Buffer(tsInterface);
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-json2dts', err));
		}

		cb();
	});
};
