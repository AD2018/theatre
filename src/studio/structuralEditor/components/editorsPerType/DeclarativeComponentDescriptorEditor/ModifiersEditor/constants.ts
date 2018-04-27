export const ACTION: {[key: string]: string} = {
  BOX_ADD: 'BOX_ADD',
  BOX_MOVE: 'BOX_MOVE',
  BOX_SET_TYPE: 'BOX_SET_TYPE',
}

export const STATUS: {[key: string]: string} = {
  UNCHANGED: 'UNCHANGED',
  INITIALIZED: 'INITIALIZED',
  UNINITIALIZED: 'UNINITIALIZED',
  RELOCATED: 'RELOCATED',
}

export const STATUS_BY_ACTION: {[key: string]: string} = {
  DEFAULT: STATUS.UNCHANGED,
  BOX_ADD: STATUS.UNINITIALIZED,
  BOX_MOVE: STATUS.RELOCATED,
  BOX_SET_TYPE: STATUS.INITIALIZED,
}
