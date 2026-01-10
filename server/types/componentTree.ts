export type ComponentNode = {
  id: string
  type: 
    | 'page'
    | 'section'
    | 'container'
    | 'text'
    | 'image'
    | 'button'
  props?: {
    text?: string
    src?: string
    href?: string
  }
  styles?: Record<string, string>
  children?: ComponentNode[]
}