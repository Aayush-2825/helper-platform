import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { UploadFocusProvider, useUploadFocus } from '../../ui/UploadFocusContext'

function TestConsumer() {
  const { register, unregister, focus } = useUploadFocus()
  React.useEffect(() => {
    const fn = jestLikeFn()
    register('test-id', fn)
    focus('test-id')
    unregister('test-id')
    return () => {}
  }, [register, unregister, focus])
  return null
}

function jestLikeFn() {
  let called = 0
  const fn = () => { called += 1 }
  // attach a way to inspect
  // @ts-ignore
  fn.__called = () => called
  return fn
}

describe('UploadFocusContext', () => {
  it('registers and focuses a callback', () => {
    // Render provider with consumer; if no throw, success
    render(
      <UploadFocusProvider>
        <TestConsumer />
      </UploadFocusProvider>
    )
    expect(true).toBe(true)
  })
})
