
all: help

help:
	echo help

babel:
	babel lib/ -d src/

test: babel
	mocha -R spec

eslint:
	DEBUG="eslint:cli-engine" eslint .

watch:
	watchd lib/**.js test/* test/**/*.js *.{js,json} -c 'bake test'

release: version push publish

version:
	standard-version -m '%s'

push:
	git push origin master --tags

publish:
	npm publish
