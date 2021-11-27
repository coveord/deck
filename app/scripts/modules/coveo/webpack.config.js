const { getBaseConfig } = require('../base.webpack.config');
const baseConfig = getBaseConfig('coveo');

module.exports = {
  ...baseConfig,
  externals: [...baseConfig.externals, '@spinnaker/core'],
};
