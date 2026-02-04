export interface GeneralLink {
  type: string
  url: string
  label: string
}

export interface GeneralSkills {
  languages: string
  frameworks: string
  tools: string
  libraries: string
}

export interface General {
  name: string
  email: string
  phone: string
  location: string
  links: GeneralLink[]
  skills: GeneralSkills
}
