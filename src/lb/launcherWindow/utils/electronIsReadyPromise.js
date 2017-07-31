// @flow
import wn from 'when'
import {app} from 'electron'

const installDevtoolsExtensions = () => {
  require('electron-debug')({showDevTools: true})

  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS,
  } = require('electron-devtools-installer')

  return installExtension(REACT_DEVELOPER_TOOLS).then(installExtension(REDUX_DEVTOOLS))
}

app.dock.hide()

function waitForElectron() {
  const d = wn.defer()
  // @note we might have to increase the maxListeners on ipcMain if we get maxListeners warnings
  // ipcMain.setMaxListeners(100)
  app.on('ready', d.resolve)
  return d.promise
}

export default waitForElectron().then(() => {
  if (process.env.NODE_ENV === 'development')
    return installDevtoolsExtensions()
})