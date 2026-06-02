import { describe, it, expect } from 'vitest'
import { getStepFieldPaths } from '../HelperOnboardingWizard'

describe('getStepFieldPaths', () => {
  it('includes languages and dpdpConsentGiven for individual', () => {
    const paths = getStepFieldPaths(3, true)
    expect(paths).toContain('languages')
  })

  it('includes business fields for agency', () => {
    const paths = getStepFieldPaths(2, false)
    expect(paths).toContain('businessRegistrationUrl')
  })
})
