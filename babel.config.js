module.exports = (api) => {
	api.cache(true);

	return {
		presets: [ "@babel/preset-env", "@babel/preset-typescript" ],
		plugins: [ "@babel/proposal-class-properties", "@babel/proposal-object-rest-spread" ]
	};
};
