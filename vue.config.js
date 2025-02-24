const RemoveServiceWorkerPlugin = require('webpack-remove-serviceworker-plugin')
const webpack = require('webpack')
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const appName = JSON.parse(packageJson).appName
const appVersion = JSON.parse(packageJson).version
const sbcName = JSON.parse(packageJson).sbcName
const sbcVersion = JSON.parse(packageJson).dependencies['sbc-common-components']
const aboutText1 = (appName && appVersion) ? `${appName} v${appVersion}` : ''
const aboutText2 = (sbcName && sbcVersion) ? `${sbcName} v${sbcVersion}` : ''

module.exports = {
  configureWebpack: {
    plugins: [
      // this is needed to remove existing service workers on users' systems
      // ref: https://www.npmjs.com/package/webpack-remove-serviceworker-plugin
      // ref: https://github.com/NekR/self-destroying-sw/tree/master/packages/webpack-remove-serviceworker-plugin
      new RemoveServiceWorkerPlugin({ filename: 'service-worker.js' }),
      new webpack.DefinePlugin({
        'process.env': {
          ABOUT_TEXT:
            (aboutText1 && aboutText2) ? `"${aboutText1}<br>${aboutText2}"`
              : aboutText1 ? `"${aboutText1}"`
                : aboutText2 ? `"${aboutText2}"`
                  : ''
        }
      })
    ],
    devtool: 'source-map'
  },
  transpileDependencies: [
    'vue-plugin-helper-decorator',
    'vuetify'
  ],
  publicPath: `/${process.env.VUE_APP_PATH}`,
  devServer: {
    proxy: {
      // this is needed to prevent a CORS error when running locally
      '/local-keycloak-config-url/*': {
        target: 'https://dev.bcregistry.ca/business/config/kc/',
        pathRewrite: {
          '/local-keycloak-config-url': ''
        }
      },
      // this is needed to avoid a PAYBC Not Found error when running locally
      '/status/PAYBC': {
        target: 'https://status-api-dev.apps.silver.devops.gov.bc.ca/api/v1/status/PAYBC',
        pathRewrite: {
          '/status/PAYBC': ''
        }
      }
    }
  }
}
