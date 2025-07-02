import { nextTick } from 'vue'

export class NavigationService {
  async focusElement(selector: string): Promise<boolean> {
    try {
      await nextTick()
      const element = document.querySelector(selector) as HTMLElement
      
      if (element && typeof element.focus === 'function') {
        element.focus()
        return true
      }
      
      console.warn(`Element with selector "${selector}" not found or not focusable`)
      return false
    } catch (error) {
      console.error('Error focusing element:', error)
      return false
    }
  }

  async focusSearchInput(): Promise<boolean> {
    return this.focusElement('.header__input')
  }
}

export const navigationService = new NavigationService()
