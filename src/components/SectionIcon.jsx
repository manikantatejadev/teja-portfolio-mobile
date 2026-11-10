import {
  BadgeCheck,
  BriefcaseBusiness,
  FileDown,
  FileText,
  GraduationCap,
  Languages,
  Layers3,
  Send,
  Sparkles,
  Trophy,
} from 'lucide-react'

const ICONS = {
  BadgeCheck,
  BriefcaseBusiness,
  FileDown,
  FileText,
  GraduationCap,
  Languages,
  Layers3,
  Send,
  Sparkles,
  Trophy,
}

export function SectionIcon({ name, size = 20, ...props }) {
  const Icon = ICONS[name] || Sparkles
  return <Icon size={size} aria-hidden="true" {...props} />
}
