import classNames from 'classnames'

interface CardProps {
  id?: string
  classes?: string
  tabIndex?: number
  ariaLabelledby?: string
  role?: string
  onClick?: () => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export const Card: React.FC<CardProps> = ({
  id,
  children,
  classes,
  tabIndex,
  ariaLabelledby,
  role,
  onClick,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}) => {
  return (
    <article
      id={id}
      className={classNames(
        'bg-white rounded-lg border border-gray-200 shadow-md',
        classes
      )}
      tabIndex={tabIndex}
      aria-labelledby={ariaLabelledby}
      role={role}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </article>
  )
}
